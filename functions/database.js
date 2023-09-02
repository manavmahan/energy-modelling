import axios from 'axios';
import { DB_VARIABLES } from './constants';
const URL = 'https://energy.manavmahan.de/api/database'


function isSuccess(data, setFormData){
    if (data.ERROR){
      console.log(data.ERROR, data.QUERY);
      setFormData((prevState)=>({...prevState, 'msg': `SQL DB Error: ${data.ERROR}`}));
      return false;
    }
    return true;
}

async function callDBAPI(query){
    let response = await axios.post(URL, query);
    if (response.status === 500){
        throw new Error('Database API is not running!');
    }
    return response.data;
}

export async function executeQuery(query, callback, callback2=()=>{}, isString=false){
    let query1 = {
        "QUERY": query,
    };
    let data = await callDBAPI(query1);
    let returnValue = null;
    if (data.ERROR) {
        returnValue = data.ERROR;
        callback2(false);
    } else {
        callback2(true);
        returnValue = data.RESULTS;
    }
    callback(isString ? JSON.stringify(returnValue, null, 2) : returnValue);
}

export async function getUsers(){
    let query = {
        "TYPE": "SEARCH", 
        "TABLE_NAME": "projects", 
        "COLUMN_NAMES": "USER_NAME", 
        "CONDITIONS": "TRUE",
    };

    let data = await callDBAPI(query)
    if (data.ERROR) return [];
    let userNames = data.RESULTS.map(r=>r[0]);
    let uniqueNames = new Set(userNames);
    return uniqueNames;
}

export async function isValidUser(userName){
    let query = {
        "TYPE": "COUNT", 
        "TABLE_NAME": "projects", 
        "COLUMN_NAMES": "USER_NAME", 
        "CONDITIONS": `USER_NAME='${userName}'`,
    }
    let data = await callDBAPI(query);
    return !data.ERROR && Boolean(Object.values(data.RESULTS[0])[0]);
}

export async function isValidUserProject(userName, projectName){
    let query = {
        "TYPE": "COUNT", 
        "TABLE_NAME": "projects", 
        "COLUMN_NAMES": "USER_NAME", 
        "CONDITIONS": `USER_NAME='${userName}' AND PROJECT_NAME='${projectName}'`,
    }
    
    let data = await callDBAPI(query);
    return !data.ERROR && Boolean(Object.values(data.RESULTS[0])[0]);
}

export async function setGeometry(set, formData){
    if (!formData.projectName || !formData.userName){
        set(null);
        return false;
    } 
  
    let query = {
      "TYPE": "SEARCH", 
      "TABLE_NAME": "projects", 
      "COLUMN_NAMES": "GEOMETRY", 
      "CONDITIONS": `PROJECT_NAME='${formData.projectName}' AND USER_NAME='${formData.userName}'`,
    }
    
    let data = await callDBAPI(query);
    return setFromData(set, data, userName, projectName, "GEOMETRY");
}

export async function setScaling(set, formData){
    let query = {
      "TYPE": "SEARCH", 
      "TABLE_NAME": "projects", 
      "COLUMN_NAMES": "SCALING", 
      "CONDITIONS": `PROJECT_NAME='${formData.projectName}' AND USER_NAME='${formData.userName}'`,
    }
    let data = await callDBAPI(query);
    if (data.ERROR){
        return false;
    }

    if (! data.RESULTS[0]){
        return false;
    }
    return setFromData(set, data, userName, projectName, "SCALING");
}

export async function setResults(set, formData){
    let query = {
      "TYPE": "SEARCH", 
      "TABLE_NAME": "projects", 
      "COLUMN_NAMES": "RESULTS", 
      "CONDITIONS": `PROJECT_NAME='${formData.projectName}' AND USER_NAME='${formData.userName}'`,
    }
    let data = await callDBAPI(query);
    return setFromData(set, data, userName, projectName, "RESULTS");
}

export async function getColumn(name, columnName, isString=true){
    let query = {
        "TYPE": "SEARCH", 
        "TABLE_NAME": "projects", 
        "COLUMN_NAMES": `${columnName}`, 
        "CONDITIONS": `PROJECT_NAME='${name.projectName}' AND USER_NAME='${name.userName}'`,
    }
    let data = await callDBAPI(query);
    let returnValue = {
        state: "invalid",
        value: null,
    };

    if (data.ERROR) {
        returnValue.value = data.ERROR;
    } else {
        if (!data.RESULTS || data.RESULTS.length == 0 || !data.RESULTS[0][columnName])
            returnValue.value = `cannot find ${name.userName} - ${name.projectName} - ${columnName} \n ${data['QUERY']}`;
        else{
            try{
                returnValue.state = "valid";
                returnValue.value = isString ?
                    JSON.stringify(JSON.parse(data.RESULTS[0][columnName]), null, 2):
                    JSON.parse(data.RESULTS[0][columnName]);
            }catch{
                returnValue.value = data.RESULTS[0][columnName];
            }
        }
    }
    return returnValue;
}

export async function getColumnValueDB(tableName, conditions, columnName, callback, isString=true){
    let query = {
        "TYPE": "SEARCH", 
        "TABLE_NAME": tableName, 
        "COLUMN_NAMES": columnName, 
        "CONDITIONS": conditions,
    }
    let data = await await callDBAPI(query);
    let returnValue = null;
    if (data.ERROR) {
        returnValue = data.ERROR;
    } else {
        if (!data.RESULTS || data.RESULTS.length == 0 || !data.RESULTS[0][columnName])
            returnValue = `cannot find ${conditions} in ${tableName}; ${data['QUERY']}`;
        else 
            returnValue = JSON.parse(data.RESULTS[0][columnName]);
    }
    callback(isString ? JSON.stringify(returnValue, null, 2) : returnValue);
}

export async function setColumnValueDB(tableName, conditions, columnName, value, 
    callback, isString=true){
    let query = {
        "TYPE": "UPDATE_ITEM", 
        "TABLE_NAME": tableName, 
        "SET_VALUES": `${columnName}='${value}'`,
        "CONDITIONS": conditions,
    }
    let data = await callDBAPI(query);
    if (data.ERROR) callback(JSON.stringify(data.ERROR, null, 2));
    else getColumnValueDB(tableName, conditions, columnName, callback, isString);
}

export async function insertColumnValueDB(tableName, columnNames, columnValues, callback, 
    callback2, newName,){
    let query = {
        "TYPE": "INSERT_ITEM", 
        "TABLE_NAME": tableName, 
        "COLUMN_NAMES": columnNames,
        "COLUMN_VALUES": columnValues,
    }
    let data = await callDBAPI(query);
    if (data.ERROR) {callback(JSON.stringify(data.ERROR, null, 2));}
    else { callback2(newName);}
}

export async function deleteColumnValueDB(tableName, conditions, callback, 
    callback2, newName,){
    let query = {
        "TYPE": "DELETE_ITEM", 
        "TABLE_NAME": tableName, 
        "CONDITIONS": conditions,
    }
    let data = await callDBAPI(query);
    if (data.ERROR) {callback(JSON.stringify(data.ERROR, null, 2));}
    else { callback2(newName);}
}

export async function getNames(tableName){
    let query = {
        "TYPE": "SEARCH", 
        "TABLE_NAME": tableName, 
        "COLUMN_NAMES": 'name',
        "CONDITIONS": true,
    }
    let data = await callDBAPI(query);
    console.log(Object.values(data['RESULTS']).forEach(v=>v['name']))

    return Object.values(data['RESULTS']);
}

function setFromData(setFunc, data, userName, projectName, columnName){
    if (data.ERROR){
        setFunc(JSON.stringify(data.ERROR));
        return false;
    }

    if (!data.RESULTS || data.RESULTS.length == 0 || !data.RESULTS[0][columnName]){
        setFunc(`cannot find ${userName} - ${projectName} - ${columnName}`);
        return false;
    }

    setFunc(JSON.parse(data.RESULTS[0][columnName]));
    return true;
}

export async function updateColumn(name, columnName, columnValue, callback){
    let query = {
        "TYPE": "UPDATE_ITEM", 
        "TABLE_NAME": "projects", 
        "SET_VALUES": `${columnName}='${columnValue}'`,
        "CONDITIONS": `PROJECT_NAME='${name.projectName}' AND USER_NAME='${name.userName}'`,
    }
    let data = await callDBAPI(query);
    if (data.ERROR) callback(JSON.stringify(data.ERROR, null, 2));
    else getColumn(name, columnName, callback);
}

async function getColumnNames(setFunction, tableName){
    let query = {
        "QUERY": `SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ${tableName}`
    }

    let data = await callDBAPI(query);

    if (data.ERROR){
        setFunction(JSON.stringify(data.ERROR));
        return false;
    }

    if (!data.RESULTS || data.RESULTS.length == 0 || !data.RESULTS[0][columnName]){
        setFunction(`cannot find column names ${tableName}`);
        return false;
    }

    setFunction(JSON.parse(data.RESULTS[0][columnName]));
    return true;
}
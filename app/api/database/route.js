import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../auth/[...nextauth]/route";
import axios from 'axios';

const AllowedUsers = ['manav.mahan.singh@live.in'];

const id = process.env.API_ID;
const url = 'https://db.manavmahan.de/'

const config = {
    headers:{
        id: id,
    }
}

async function callDatabase(req){
    let response = await axios.post(url, req, config);
    if (response.status > 499){
        console.log(`Error: Cannot connect to database\t${Object.entries(req).forEach(([k, v]) => {`${k}: ${v}`})}`);
        throw new Error('Cannot connect to database!');
    }
    return response.data;
}

export async function POST(req) {
    try{
        const query = await req.json();
        console.log(`Query: ${JSON.stringify(query)}`);
        const session = await getServerSession(authOptions);

        if (session && AllowedUsers.includes(session.user.email)){
            let response = await callDatabase(query);
            return NextResponse.json(response);
        }

        if (!query['QUERY'] && (query['TYPE']==='SEARCH' || query['TYPE']==='COUNT'))
        {
            let response = await callDatabase(query);
            return NextResponse.json(response);
        }

        console.log('Error: Restricted content!\t', 
            'session: ', session, '\t', 
            'query: ', query['QUERY'], '\t', 
            'type: ', query['TYPE']);

        return NextResponse.json({
            ERROR: "Restricted content!",
            authenticated: !!session,
            session,
        }, {status: 403});
    }catch (err){
        return NextResponse.json({
            ERROR: "Unexpected Error!",
        }, {status: 501});
    }
}
  
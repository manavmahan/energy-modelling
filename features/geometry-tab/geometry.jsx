'use client';

import React, { useEffect, useState, } from "react"
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false, });
import earcut from "earcut";

import { getColumn } from "@/functions/database";
import { UserProjectInput } from "@/components/project-button";
// import styles from '@/styles/utils.module.css'

const colors = {Wall:'#874251', intWall:'#994251', Window:'#0288d1', Floor:'#c39b77', Ceiling:'#121414', Roof:'#c9c062', site:'#77ab59'}
const opacity = {Wall: 0.3, ntWall:0.1, Window:0.3, Floor:0.3, Ceiling:0.3, Roof:0.3, site:0.5}

function GenerateXYZs(element){
    let xyzs = element['XYZs'].split(',').slice(1);
    element['xs'] = [];
    element['ys'] = [];
    element['zs'] = [];

    let xys = [];

    while (xyzs.length>0){
        const [x, y, z] = [Number(xyzs.shift(1)), Number(xyzs.shift(1)), Number(xyzs.shift(1))];
        element['xs'].push(x);
        element['ys'].push(y);
        element['zs'].push(z);
        xys.push(x);
        xys.push(y);
    }
    element['del'] = 'x';
    if (element['xs'].every(a=>a===element['xs'][0]))
        element['del'] = 'x';
    if (element['ys'].every(a=>a===element['ys'][0]))
        element['del'] = 'y';
    if (element['zs'].every(a=>a===element['zs'][0]))
        element['del'] = 'z';

    if (element['del'] == 'z') element['xys'] = xys;
}

function generateBuildingElements(geom,)
{
    if (!geom || typeof geom === 'string') return <p>{geom}</p>
    let buildingElements = geom.filter(obj => /^(Building|Fenestration)Surface:Detailed/.test(obj['__IDFName__']));

    let data = []
    let elements = Array.from(buildingElements);
    elements.forEach(e => GenerateXYZs(e));
    let allXs = elements.map(e => e['xs']).flat()
    let allYs = elements.map(e => e['ys']).flat()
    let allZs = elements.map(e => e['zs']).flat()

    const [xh, yh, zh] = [Math.max(...allXs)+1, Math.max(...allYs)+1, Math.max(...allZs)+1];
    const [xl, yl, zl] = [Math.min(...allXs)-1, Math.min(...allYs)-1, Math.min(...allZs)-1];

    let layout = { 
        'scene':{
            'xaxis': { 'visible': true, 'range': [xl, xh], },
            'yaxis': { 'visible': true, 'range': [yl, yh], },
            'zaxis': { 'visible': true, 'range': [zl, zh], },
            'aspectratio':{'x':1, 'y':(yh-yl)/(xh-xl), 'z':(zh-zl)/(xh-xl)},
            'camera': {
                'up': {'x':0, 'y':0, 'z':1},
                'center': {'x':0, 'y':-.3, 'z':0},
                'eye': {'x':1.8, 'y':-1.2, 'z':0.25},
            }
        },
        'paper_bgcolor':"rgba(225,225,225, 0)",
        'plot_bgcolor':"rgba(225,225,225, 0)",
        'margin': {'l': 0, 'r': 0, 'b': 0, 't': 0},
        'width': 'fit-content',
        'height': 'fit-content',
        'showlegend': false,
        'hovermode': true,
    }

    let config = {displayModeBar:false, responsive: true};

    elements.forEach(e => {
        if (e['del'] == 'z'){
            var tria = earcut(e['xys']);
        }

        let face = {
            type: 'mesh3d',
            x: e['xs'],
            y: e['ys'],
            z: e['zs'],
            i: tria ? tria.filter((e0, i) => i % 3 == 0) : null,
            j: tria ? tria.filter((e1, i) => i % 3 == 1) : null,
            k: tria ? tria.filter((e2, i) => i % 3 == 2) : null,
            delaunayaxis: e['del'],
            color: colors[e.SurfaceType],
            opacity: opacity[e.SurfaceType],
            name: e['Name'],
            surfaceType: e.SurfaceType,
        };
        data.push(face);
    });
    return (
        <div className="flex justify-center mt-12">
            <Plot data={data} layout={layout} config={config} onClick ={(e)=>showNote(e,)}/>
        </div>
    )
}

async function showNote(e, ) {
    let data = e.points[0].data;
    let info = `Type: ${data.surfaceType}\nName: ${data.name}\nX: ${data.x}\nY: ${data.y}\nZ: ${data.z}`;
    // setInfo(data.surfaceType)
    try{
        await navigator.clipboard.writeText(info);
    } catch (e){
        console.log('cannot execute copy!');
    } 
    alert(`Type: ${data.surfaceType}\nName: ${data.name}\nX: ${data.x}\nY: ${data.y}\nZ: ${data.z}`);
}

export default function PlotGeometry({userProjectName}){
    const [geom, setGeom] = useState(null);

    useEffect(()=>{
        setGeom('waiting...');
        
        console.log(userProjectName);
        if (userProjectName.valid){
            
            setGeom('fetching...');
            getColumn(userProjectName, "GEOMETRY", false).then((value)=>{
                setGeom(value.value);
            }).catch((error)=>{
                setGeom(error.message);
            });
        }
    }, [userProjectName]);

    return generateBuildingElements (geom);
}

// export default function Geometry(){ 
//     const {userProjectName: userProjectName, 
//         props: props
//     } = UserProjectInput();

//     return (
//         <div>
//             {props}
//             <plotGeometry userProjectName={userProjectName}/>
//         </div>
//     );
// }

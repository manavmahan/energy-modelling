'use client';

import React, { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false, });

import { getColumn } from "../../functions/database";
import { DB_VARIABLES } from "../../functions/constants";
import { Scaling, ColorScale, DataFrame } from "../../functions/custom-classes";

const colors = ['#874251', '#994251', '#0288d1','#c39b77', '#121414', '#c9c062', '#77ab59']
const layout = {
    'width': '100%',
    'height': '100%',
    'paper_bgcolor':"rgba(1,0,0,0)",
    'plot_bgcolor':"rgba(0,0,0,0)",
    'margin': {'l': 0, 'r': 0, 'b': 0, 't': 0},
    'showlegend': false,
    'hovermode': 'closest',
    xaxis: {
        showgrid: false, 
        zeroline: false, 
        visible: false,  
    },
    yaxis: {
        showgrid: false, 
        zeroline: false, 
        visible: false,  
    },
}

const config = {displayModeBar:false, responsive: true};

const dims = {
    xGapParametersResults: 2,
    xGapResultsScale: 1.5,

    yGapResults: 0.2,
    gapText: 0.02,
    gradParts: 5,
}

function addGradScale(data, annotations, scale, x, y, len, label, unit){
    for (let g=0; g<dims.gradParts; g++){
        data.push({
            type: 'scatter',
            x: [x, x,],
            y: [y + g * (len/dims.gradParts), y + (g+1) * (len/dims.gradParts)],
            mode: 'lines',
            line: {
                color: scale.getColor(Number(g * scale.range / dims.gradParts) + Number(scale.min)),
                width: 5,
            },
            hoverinfo: 'skip',
        });
    }

    let texts = [{
        x: x + 0.2,
        y: y,
        text: unit ? `${scale.min} ${unit}` : '',
    },
    {
        x: x + 0.2,
        y: y + 0.5 * dims.yGapResults,
        text: label,
    },
    {
        x: x + 0.2,
        y: y + len,
        text: unit ? `${scale.max} ${unit}` : '',
    }]

    texts.forEach(t=>{
        annotations.push({
            ...t,
            xanchor: 'left',
            showarrow: false,
        })
    })
}

function addAxisForMXPlot(data, annotations, parameters, scalingPars, predictions, errorScale ){
    parameters.columns.forEach((p, i)=>{
        let annoDefaults = {
            x: i,
            color: colors[colors.length % i],
            showarrow: false,
            font: {
                size:10,
            }
        }
        data.push({
            type: 'scatter',
            color: colors[colors.length % i],
            x: [i, i, i, i, i, i],
            y: [0, 0.2, 0.4, 0.6, 0.8, 1],
            mode: 'lines+markers',
            marker:{
                symbol: "hash-open",
                size: 5,
            },
            hoverinfo: 'skip',
        });
        annotations.push(
            {
                x: i,
                y: -dims.gapText,
                text: p,
                textangle: -90,
                xanchor: 'center',
                yanchor: 'top',
                ...annoDefaults,
            },
            {
                x: i + dims.gapText,
                y: 0,
                xanchor: 'left',
                text: scalingPars.minValues[i].toFixed(2),
                ...annoDefaults,
            },
            {
                x: i + dims.gapText,
                y: 1.0,
                text: (scalingPars.minValues[i] + scalingPars.ranges[i]).toFixed(2),
                xanchor: 'left',
                ...annoDefaults,
            },
        );
        i += 1;
    });

    let value = predictions.getAllValuesFlat();
    let consumptionScale = new ColorScale('#999999ff', '#ff7f0eff', Math.min(...value).toFixed(2), Math.max(...value).toFixed(2));
    
    let i = parameters.columns.length + dims.xGapParametersResults - 1;
    let total = predictions.shape[1];
    let len = (1.0 - dims.yGapResults) / total;
    let y = 0;
    predictions.columns.forEach(p=>{
        addGradScale(data, annotations, consumptionScale, i, y, len, p.slice(0, 3), null);
        y += len + dims.yGapResults/(total-1);
    });

    i += 1.5

    addGradScale(data, annotations, consumptionScale, i, 0.0, 0.4, 'Consumption', 'MWh');
    addGradScale(data, annotations, errorScale, i, 0.6, 0.4, 'Errors', '%');
}

function addParametersAndResults(data, annotation, parameters, predictions, scaling, errors, totalError,){
    let values = Array.from([...errors.getAllValuesFlat(), ...totalError.getAllValuesFlat()]);
    let minValue = Math.floor(Math.min(...values)/10) * 10;
    let maxValue = Math.ceil(Math.max(...values)/10) * 10
    let errorScale = new ColorScale('#1f77b4', '#d62728', minValue, maxValue);

    let scalingPars = new Scaling(...Object.values(scaling[DB_VARIABLES.PARAMETERS]));
    let scalingPred = new Scaling(...Object.values(scaling[DB_VARIABLES.PREDICTIONS]));

    parameters.index.forEach(p => {
        let x = parameters.shape[1];
        let yValues = parameters.getRow(p);
        let y = scalingPars.getScaledValues(yValues);
        let pars = {
            name: p,
            type: 'scatter',
            x: x,
            y: y,
            mode: 'lines',
            line: {
                color: errorScale.getColor(totalError.getColumn(p)),
                width: 1,
                dash: 'dashdot',
            },
            text: yValues,
            hovertemplate: '%{text:0.2f}',
        }
        data.push(pars);

        x = [x-1, x + 1]
        y = y.slice(-1)[0]
        let total = predictions.shape[1]
        let len = (1.0 - dims.yGapResults) / total;
        let cY = 0;
        let predsRow = predictions.getRow(p);
        let scaledPreds = scalingPred.getScaledValues(predsRow);
 
        predictions.columns.forEach((k, v) => {
            let yNext = Number(scaledPreds[v]);
            let preds = {
                name: p,
                type: 'scatter',
                x: x,
                y: [y, yNext * len + cY],
                mode: 'lines',
                line: {
                    color: errorScale.getColor(errors.getAt(v, k)),
                    width: 1,
                    dash: 'dashdot',
                },
                text: [yValues.slice(-1)[0], predsRow[v]],
                hovertemplate: '%{text:0.2f}',
            };
            data.push(preds);
            cY += len + dims.yGapResults/(total-1);
        })
    });
    return [scalingPars, errorScale];
}

function generateResults(status, results, scaling){
    if (status !== "UPDATED") return <p>{status}</p>
    if (!results || typeof results === 'string') return <p>Results: {results}</p>
    if (!scaling || typeof scaling === 'string') return <p>Results: {scaling}</p>

    let parameters = new DataFrame(results[DB_VARIABLES.PARAMETERS]);
    let predictions = new DataFrame(results[DB_VARIABLES.PREDICTIONS]);
    let errors = new DataFrame(results[DB_VARIABLES.ERRORS]);
    let totalError = new DataFrame(results[DB_VARIABLES.TOTAL_ERROR]);

    let data = []
    let annotations = []

    const [scalingPars, errorScale] = addParametersAndResults(data, annotations, parameters, predictions, scaling, errors, totalError);
    addAxisForMXPlot(data, annotations, parameters, scalingPars, predictions, errorScale);
    
    layout['annotations'] = annotations;

    return (
        <div className="flex self-center items-center">
            <Plot className="flex self-center items-center" data={data} layout={layout} config={config}/>
        </div>
    )
}

export default function PlotProperties({userProjectName},){
    const [status, setStatus] = useState(null);
    const [results, setResults] = useState(null);
    const [scaling, setScaling] = useState(null);

    useEffect(()=>{
        setResults('waiting...');
        if (userProjectName.valid){
            setResults('fetching...');
            getColumn(userProjectName, DB_VARIABLES.STATUS, false).then((value)=>{
                setStatus(value.value);
            });
            getColumn(userProjectName, DB_VARIABLES.RESULTS, false).then((value)=>{
                setResults(value.value);
            }).catch((error)=>{
                setResults(error.message);
            });
            getColumn(userProjectName, DB_VARIABLES.SCALING, false).then((value)=>{
                setScaling(value.value);
            });
        }
    }, [userProjectName]);

    return generateResults(status, results, scaling);
}
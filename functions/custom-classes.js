export class Scaling{
    constructor(minValues, ranges){
        this.minValues = Object.values(minValues);
        this.ranges = Object.values(ranges);
    }

    getScaledValues(values){
        let scaledValues = [];
        Object.values(values).forEach((v, i)=>{
            scaledValues.push(this.getScaledValue(v, i));
        })
        return scaledValues;
    }

    getScaledValue(value, i=0){
        return (value-this.minValues[i])/this.ranges[i];
    }
}

export class ColorScale{
    constructor(c1, c2, min, max=1.0, range=null){
        this.color1 = c1
        this.color2 = c2
        this.scale = new Scaling([min], [range? range: (max-min)])
        this.min = min
        this.max = max
        this.range = this.max - this.min
    }

    hexToRgb(hex) {
        if (hex.length==7){
            hex += 'ff'
        }
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
          a: parseInt(result[4], 16)
        } : null;
    }

    componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    rgbToHex(r, g, b, a='255') {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b) + this.componentToHex(a);
    }

    getWeighedColor(col1, col2, w=0.5){
        let c1 = this.hexToRgb(col1)
        let c2 = this.hexToRgb(col2)
        let colorArray = []
        Object.keys(c1).forEach(k => {
            colorArray.push(Math.round(c1[k]*(1-w) + w*c2[k]));
        })
        return this.rgbToHex(...colorArray)
    }

    getColor(value){
        return this.getWeighedColor(this.color1, this.color2, this.scale.getScaledValue(value));
    }
}

export class DataFrame{
    constructor(dict){
        this.dict = dict;
        this.columns = Object.keys(this.dict);
        let firstValue = Object.values(this.dict)[0];
        if (firstValue.constructor == Object){
            this.index = Object.keys(Object.values(this.dict)[0]);
            this.shape = [this.index.length, this.columns.length];
            this.length = this.shape[0];
        }else{
            this.columns = null;
            this.shape = null;
            this.index = Object.keys(this.dict)[0];
            this.length = Object.keys(this.dict).length;
        }
    }

    getRow(rowName){
        if (!this.columns) return this.getAllValuesFlat();
        let i = this.index.indexOf(rowName);
        return this.getAllValues().map(x => x[i]).flat(2);
    }

    getColumn(columnName){
        return this.dict[columnName];
    }

    getAt(rowName, columnName){
        return this.getColumn(columnName)[rowName];
    }

    getAllValues(){
        if (this.columns){
            let array = []
            Object.values(this.dict).forEach(v=>{
                array.push(Object.values(v));
            });
            return array;
        }
        return Object.values(this.dict);
    }

    getAllValuesFlat(){
        return this.getAllValues().flatMap(a=>a);
    }

    show(){
        console.log({
            index: this.index,
            columns: this.columns,
            firstColumn: this.getColumn(this.columns[0]),
            firstRow: this.getRow(this.index[0]),
            firstElement: this.getAt(this.index[0], this.columns[0])
        });
    }
}
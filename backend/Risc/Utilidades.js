export const stringConversor = (str) => {
    const resultado = []
    let elementIndex = 0
    let intRepresentation = 0;
    let shift = 0;

    while (elementIndex < str.length) {
        intRepresentation = intRepresentation | (str.charCodeAt(elementIndex) << shift)
        shift += 8
        if (shift >= 32) {
            resultado.push(intRepresentation)
            intRepresentation = 0
            shift = 0
        }
        elementIndex++
    }

    if (shift > 0) {
        resultado.push(intRepresentation);
    } else {
        resultado.push(0);
    }

    return resultado;
}


export const concatenarStrings = (str) => {
    const resultado = []
    let elementIndex = 0

    while (elementIndex < str.length) {
        resultado.push(str.charCodeAt(elementIndex))
        elementIndex++
    }
    resultado.push(0)
    return resultado;
}

export const floatConversor = (number) => {

    const buffer = new ArrayBuffer(4);
    const float32arr = new Float32Array(buffer);
    const uint32arr = new Uint32Array(buffer);
    float32arr[0] = number;

    const integer = uint32arr[0];
    const hexRepr = integer.toString(16);
    return '0x' + hexRepr;
}
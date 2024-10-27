import { BaseVisitor } from "../Patron/Visitor.js";

export class frameFunc extends BaseVisitor {

    constructor(baseOffset) {
        super();
        this.frameFunc = [];
        this.localSize = 0;
        this.baseOffset = baseOffset;
    }
    
    /**
    * @type {BaseVisitor['visitDeclaracionVariable']}
    */
    visitDeclaracionVariable(node) {
        this.frameFunc.push({
            id: node.id,
            offset: this.baseOffset + this.localSize,
        });
        this.localSize += 1;
    }

    /**
    * @type {BaseVisitor['visitBloque']}
    */
        visitBloque(node) {
            node.instrucciones.forEach(dcl => dcl.accept(this));
        }
    
    /**
    * @type {BaseVisitor['visitIf']}
    */
    visitIf(node) {
        node.verdad.accept(this);
        if (node.falso) node.falso.accept(this);    }
    

    /**
    * @type {BaseVisitor['visitWhile']}
    */
    visitWhile(node) {
        node.instrucciones.accept(this);
    }
    

    /**
    * @type {BaseVisitor['visitFor']}
    */
    visitFor(node) {
        node.sentencias.accept(this);
    }






    /**
     * @param {Expresion} node
     * @returns {any}
     */
    visitExpresion(node) {
        // throw new Error('Metodo visitExpresion no implementado Funciones');
    }
    

    /**
     * @param {OperacionAritmetica} node
     * @returns {any}
     */
    visitOperacionAritmetica(node) {
        // throw new Error('Metodo visitOperacionAritmetica no implementado Funciones');
    }
    

    /**
     * @param {TipoOf} node
     * @returns {any}
     */
    visitTipoOf(node) {
        // throw new Error('Metodo visitTipoOf no implementado Funciones');
    }
    

    /**
     * @param {TypeOf} node
     * @returns {any}
     */
    visitTypeOf(node) {
        // throw new Error('Metodo visitTypeOf no implementado Funciones');
    }
    

    /**
     * @param {ParseInt} node
     * @returns {any}
     */
    visitParseInt(node) {
        // throw new Error('Metodo visitParseInt no implementado Funciones');
    }
    

    /**
     * @param {ParseFloat} node
     * @returns {any}
     */
    visitParseFloat(node) {
        // throw new Error('Metodo visitParseFloat no implementado Funciones');
    }
    

    /**
     * @param {ToString} node
     * @returns {any}
     */
    visitToString(node) {
        // throw new Error('Metodo visitToString no implementado Funciones');
    }
    

    /**
     * @param {ToLowerCase} node
     * @returns {any}
     */
    visitToLowerCase(node) {
        // throw new Error('Metodo visitToLowerCase no implementado Funciones');
    }
    

    /**
     * @param {ToUpperCase} node
     * @returns {any}
     */
    visitToUpperCase(node) {
        // throw new Error('Metodo visitToUpperCase no implementado Funciones');
    }
    

    /**
     * @param {OperacionUnaria} node
     * @returns {any}
     */
    visitOperacionUnaria(node) {
        // throw new Error('Metodo visitOperacionUnaria no implementado Funciones');
    }
    

    /**
     * @param {Agrupacion} node
     * @returns {any}
     */
    visitAgrupacion(node) {
        // throw new Error('Metodo visitAgrupacion no implementado Funciones');
    }
    

    /**
     * @param {Numero} node
     * @returns {any}
     */
    visitNumero(node) {
        // throw new Error('Metodo visitNumero no implementado Funciones');
    }
    

    /**
     * @param {Cadena} node
     * @returns {any}
     */
    visitCadena(node) {
        // throw new Error('Metodo visitCadena no implementado Funciones');
    }
    

    /**
     * @param {Caracter} node
     * @returns {any}
     */
    visitCaracter(node) {
        // throw new Error('Metodo visitCaracter no implementado Funciones');
    }
    

    /**
     * @param {Ternario} node
     * @returns {any}
     */
    visitTernario(node) {
        // throw new Error('Metodo visitTernario no implementado Funciones');
    }
    


    

    /**
     * @param {ForEach} node
     * @returns {any}
     */
    visitForEach(node) {
        // throw new Error('Metodo visitForEach no implementado Funciones');
    }
    

    /**
     * @param {Break} node
     * @returns {any}
     */
    visitBreak(node) {
        // throw new Error('Metodo visitBreak no implementado Funciones');
    }
    

    /**
     * @param {Continue} node
     * @returns {any}
     */
    visitContinue(node) {
        // throw new Error('Metodo visitContinue no implementado Funciones');
    }
    

    /**
     * @param {Return} node
     * @returns {any}
     */
    visitReturn(node) {
        // throw new Error('Metodo visitReturn no implementado Funciones');
    }
    

    /**
     * @param {Llamada} node
     * @returns {any}
     */
    visitLlamada(node) {
        // throw new Error('Metodo visitLlamada no implementado Funciones');
    }
    
    /**
     * @param {DeclaracionDimension} node
     * @returns {any}
     */
    visitDeclaracionDimension(node) {
        // throw new Error('Metodo visitDeclaracionDimension no implementado Funciones');
    }
    
    /**
     * @param {Declaracion2Dimension} node
     * @returns {any}
     */
    visitDeclaracion2Dimension(node) {
        // throw new Error('Metodo visitDeclaracion2Dimension no implementado Funciones');
    }
    
    /**
     * @param {AsignacionDimensiones} node
     * @returns {any}
     */
    visitAsignacionDimensiones(node) {
        // throw new Error('Metodo visitAsignacionDimensiones no implementado Funciones');
    }
    
    /**
     * @param {AccesoDimensiones} node
     * @returns {any}
     */
    visitAccesoDimensiones(node) {
        // throw new Error('Metodo visitAccesoDimensiones no implementado Funciones');
    }
    
    /**
     * @param {Asignacion} node
     * @returns {any}
     */
    visitAsignacion(node) {
        // throw new Error('Metodo visitAsignacion no implementado Funciones');
    }
    
    /**
     * @param {ExpresionStmt} node
     * @returns {any}
     */
    visitExpresionStmt(node) {
        // throw new Error('Metodo visitExpresionStmt no implementado Funciones');
    }
    
    /**
     * @param {Struct} node
     * @returns {any}
     */
    visitStruct(node) {
        // throw new Error('Metodo visitStruct no implementado Funciones');
    }
    
    /**
     * @param {AsignacionStruct} node
     * @returns {any}
     */
    visitAsignacionStruct(node) {
        // throw new Error('Metodo visitAsignacionStruct no implementado Funciones');
    }
    
    /**
     * @param {AccesoAtributo} node
     * @returns {any}
     */
    visitAccesoAtributo(node) {
        // throw new Error('Metodo visitAccesoAtributo no implementado Funciones');
    }
    
    /**
     * @param {AsignacionAtributo} node
     * @returns {any}
     */
    visitAsignacionAtributo(node) {
        // throw new Error('Metodo visitAsignacionAtributo no implementado Funciones');
    }
    
    /**
     * @param {Switch} node
     * @returns {any}
     */
    visitSwitch(node) {
        // throw new Error('Metodo visitSwitch no implementado Funciones');
    }
    
    /**
     * @param {Decimal} node
     * @returns {any}
     */
    visitDecimal(node) {
        // throw new Error('Metodo visitDecimal no implementado Funciones');
    }

    /**
     * @param {Booleanos} node
     * @returns {any}
     */
    visitBooleanos(node) {
        // throw new Error('Metodo visitBooleanos no implementado Funciones');
    }
    
    /**
     * @param {SecuenciaEscape} node
     * @returns {any}
     */
    visitSecuenciaEscape(node) {
        // throw new Error('Metodo visitSecuenciaEscape no implementado Funciones');
    }
    
    /**
     * @param {ReferenciaVariable} node
     * @returns {any}
     */
    visitReferenciaVariable(node) {
        // throw new Error('Metodo visitReferenciaVariable no implementado Funciones');
    }
    
    /**
     * @param {Print} node
     * @returns {any}
     */
    visitPrint(node) {
        // throw new Error('Metodo visitPrint no implementado Funciones');
    }
    
    /**
     * @param {Embebidas} node
     * @returns {any}
     */
    visitEmbebidas(node) {
        // throw new Error('Metodo visitEmbebidas no implementado Funciones');
    }
    
    /**
     * @param {DeclaracionFuncion} node
     * @returns {any}
     */
    visitDeclaracionFuncion(node) {
        // throw new Error('Metodo visitDeclaracionFuncion no implementado Funciones');
    }
    
    /**
     * @param {DeclaracionArreglo} node
     * @returns {any}
     */
    visitDeclaracionArreglo(node) {
        // throw new Error('Metodo visitDeclaracionArreglo no implementado Funciones');
    }
    
    /**
     * @param {Declaracion2Arreglo} node
     * @returns {any}
     */
    visitDeclaracion2Arreglo(node) {
        // throw new Error('Metodo visitDeclaracion2Arreglo no implementado Funciones');
    }
    
    /**
     * @param {Declaracion3Arreglo} node
     * @returns {any}
     */
    visitDeclaracion3Arreglo(node) {
        // throw new Error('Metodo visitDeclaracion3Arreglo no implementado Funciones');
    }
    
    /**
     * @param {IndexArreglo} node
     * @returns {any}
     */
    visitIndexArreglo(node) {
        // throw new Error('Metodo visitIndexArreglo no implementado Funciones');
    }
    
    /**
     * @param {JoinArreglo} node
     * @returns {any}
     */
    visitJoinArreglo(node) {
        // throw new Error('Metodo visitJoinArreglo no implementado Funciones');
    }
    
    /**
     * @param {LengthArreglo} node
     * @returns {any}
     */
    visitLengthArreglo(node) {
        // throw new Error('Metodo visitLengthArreglo no implementado Funciones');
    }
    
    /**
     * @param {AccesoArreglo} node
     * @returns {any}
     */
    visitAccesoArreglo(node) {
        // throw new Error('Metodo visitAccesoArreglo no implementado Funciones');
    }
    
    /**
     * @param {AsignacionArreglo} node
     * @returns {any}
     */
    visitAsignacionArreglo(node) {
        // throw new Error('Metodo visitAsignacionArreglo no implementado Funciones');
    }
    
    /**
     * @param {AsignacionVariable} node
     * @returns {any}
     */
    visitAsignacionVariable(node) {
        // throw new Error('Metodo visitAsignacionVariable no implementado Funciones');
    }
    
}

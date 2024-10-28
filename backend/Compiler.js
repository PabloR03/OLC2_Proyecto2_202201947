import { Registros as r, RegistrosFlotantes as f } from "./Risc/Constantes.js";
import { Generador } from "./Risc/Generadores.js";
import { BaseVisitor } from "./Patron/Visitor.js";
import { ReferenciaVariable } from "./Hojas/Hojas.js";
import { frameFunc } from "./Risc/Funciones-Frame.js";


export class CompilerVisitor extends BaseVisitor {
// Hola para el que lea esto 
    constructor() {
        super();
        this.code = new Generador();
        this.continueLabel = null;
        this.breakLabel = null;
        this.functionMetada = {}
        this.insideFunction = false;
        this.frameDclIndex = 0;
        this.returnLabel = null;
    }
    //////////////////////////////////////////// TIPOS DE DATOS ////////////////////////////////////////////
    /**
     * @type {BaseVisitor['visitCadena']}
     */
    visitCadena(node) {
        this.code.comment(`Tipo de dato Cadena ${node.valor}`);
        this.code.pushContant({ type: node.tipo, valor: node.valor });
        this.code.comment(`Fin Cadena`);
    }

    /**
     * @type {BaseVisitor['visitCaracter']}
     */
    visitCaracter(node) {
        this.code.comment(`Tipo de dato caracter ${node.valor}`);
        this.code.pushContant({ type: node.tipo, valor: node.valor }); // Guardar el valor ASCII
        this.code.comment(`Fin Caracter`);
    }

    /**
     * @type {BaseVisitor['visitBooleanos']}
     */
    visitBooleanos(node) {
        this.code.comment(`Tipo de dato booleano ${node.valor}`);
        this.code.pushContant({ type: node.tipo, valor: node.valor });
        this.code.comment(`Fin Booleano`);
    }

    /**
     * @type {BaseVisitor['visitNumero']}
    */
    visitNumero(node) {
        this.code.comment(`Tipo de dato Numero ${node.valor}`);
        this.code.pushContant({ type: node.tipo, valor: node.valor });
        this.code.comment(`Fin Numero`);
        return node.valor;
        }

        //////////////////////////////////////////// OPERACIONES ARITMETICAS y UNARIAS ////////////////////////////////////////////
        /**
         * @type {BaseVisitor['visitOperacionAritmetica']}
        */

    visitOperacionAritmetica(node) {
        this.code.comment(`Operacion Binaria: ${node.op}`)
        node.izq.accept(this);
        node.der.accept(this);
        
        const isDerFloat = this.code.getTopObject().type === 'float';
        const der = this.code.popObject(isDerFloat ? f.FT0 : r.T0); // der
        const isIzqFloat = this.code.getTopObject().type === 'float';
        const izq = this.code.popObject(isIzqFloat ? f.FT1 : r.T1); // izq

        if (node.op === '&&' || node.op === '||') {
            if (izq.type === 'boolean' && der.type === 'boolean') {
                if (node.op === '&&') {
                    this.code.comment('Inicio de &&');
                    this.code.and(r.T0, r.T1, r.T0);
                    this.code.comment('Fin de &&');
                } else {
                    this.code.comment('Inicio de ||');
                    this.code.or(r.T0, r.T1, r.T0);
                    this.code.comment('Fin de ||');
                    }
                this.code.push(r.T0);
                this.code.pushObject({ type: 'boolean', length: 4 });
                } else {
                throw new Error(`Operación lógica no soportada para tipos: ${izq.type} ${node.op} ${der.type}`);
                }
            return;
        }

        if (izq.type === 'boolean' && der.type === 'boolean') {
            switch (node.op) {
                case '==':
                        this.code.comment('Inicio de ==');
                        this.code.xor(r.T0, r.T1, r.T0);
                        this.code.seqz(r.T0, r.T0);
                        this.code.push(r.T0);
                        this.code.pushObject( { type: 'boolean', length: 4 });
                        this.code.comment('Fin de ==');
                        break;
                case '!=':
                    this.code.comment('Inicio de !=');
                    this.code.xor(r.T0, r.T1, r.T0);
                    this.code.snez(r.T0, r.T0);
                    this.code.push(r.T0);
                    this.code.pushObject( { type: 'boolean', length: 4 });
                    this.code.comment('Fin de !=');
                    break;
                default:
                    throw new Error(`Operación no soportada para booleanos: ${node.op}`);
                    }
                return;
        }

        if (izq.type === 'string' && der.type === 'string') {
            switch (node.op) {
                case '+':
                    this.code.comment('Inicio de concatenación de strings');
                    this.code.add(r.A0, r.ZERO, r.T1);
                    this.code.add(r.A1, r.ZERO, r.T0);
                    this.code.callBuiltin('concatString');
                    this.code.pushObject({ type: 'string', length: 4 });
                    this.code.comment('Fin de concatenación de strings');
                    break;
                case '==':
                    this.code.comment('Inicio de comparación de igualdad de strings');
                    this.code.callBuiltin('compararString');
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    this.code.comment('Fin de comparación de igualdad de strings');
                    break;
                case '!=':
                    this.code.comment('Inicio de comparación de desigualdad de strings');
                    this.code.callBuiltin('compararString');
                    this.code.xori(r.T0, r.T0, 1);
                    this.code.push(r.T0);
                    this.code.pushObject( { type: 'boolean', length: 4 });
                    this.code.comment('Fin de comparación de desigualdad de strings');
                    break;
                default:
                    throw new Error(`Operación no soportada para strings: ${node.op}`);
                }
            return;
        }

        if (isIzqFloat || isDerFloat) {
            if (!isIzqFloat) this.code.fcvtsw(f.FT1, r.T1);
            if (!isDerFloat) this.code.fcvtsw(f.FT0, r.T0);
            
        switch (node.op) {
            case '+':
            case '+=':
                this.code.comment('Inicio de + Float');
                this.code.fadd(f.FT0, f.FT1, f.FT0);
                this.code.pushFloat(f.FT0);
                this.code.pushObject({ type: 'float', length: 4 });
                this.code.comment('Fin de + Float');
                break;
            case '-':
            case '-=':
                this.code.comment('Inicio de - Float');
                this.code.fsub(f.FT0, f.FT1, f.FT0);
                this.code.pushFloat(f.FT0);
                this.code.pushObject({ type: 'float', length: 4 });
                this.code.comment('Fin de - Float');
                break;
            case '*':
                this.code.comment('Inicio de * Float');
                this.code.fmul(f.FT0, f.FT1, f.FT0);
                this.code.pushFloat(f.FT0);
                this.code.pushObject({ type: 'float', length: 4 });
                this.code.comment('Fin de * Float');
                break;
            case '/':
                this.code.comment('Inicio de / Float');
                this.code.fdiv(f.FT0, f.FT1, f.FT0);
                this.code.pushFloat(f.FT0);
                this.code.pushObject({ type: 'float', length: 4 });
                this.code.comment('Fin de / Float');
                break;
            case '==':
                this.code.comment('Inicio de == Float');
                this.code.feq(r.T0, f.FT0, f.FT1);
                this.code.push(r.T0);
                this.code.pushObject({ type: 'boolean', length: 4 });
                this.code.comment('Fin de == Float');
                break;
            case '!=':
                this.code.comment('Inicio de != Float');
                this.code.feq(r.T0, f.FT1, f.FT0);
                this.code.xori(r.T0, r.T0, 1);
                this.code.push(r.T0);
                this.code.pushObject({ type: 'boolean', length: 4 });
                this.code.comment('Fin de != Float');
                break;
            case '>':
                this.code.comment('Inicio de > Float');
                this.code.flt(r.T0, f.FT0, f.FT1);
                this.code.push(r.T0);
                this.code.pushObject({ type: 'boolean', length: 4 });
                this.code.comment('Fin de > Float');
                break;
            case '>=':
                this.code.comment('Inicio de >= Float');
                this.code.fle(r.T0, f.FT0, f.FT1);
                this.code.push(r.T0);
                this.code.pushObject({ type: 'boolean', length: 4 });
                this.code.comment('Fin de >= Float');
                break;
            case '<':
                this.code.comment('Inicio de < Float');
                this.code.flt(r.T0, f.FT1, f.FT0);
                this.code.push(r.T0);
                this.code.pushObject({ type: 'boolean', length: 4 });
                this.code.comment('Fin de < Float');
                break;
            case '<=':
                this.code.comment('Inicio de <= Float');
                this.code.comment('Inicio de <=');
                console.log('entra a <=');
                this.code.fle(r.T0, f.FT1, f.FT0);
                this.code.push(r.T0);
                this.code.pushObject({ type: 'boolean', length: 4 });
                this.code.comment('Fin de <=');
                break;
            default:
                throw new Error(`Operación no soportada para flotantes: ${node.op}`);
            }
            return
        
    }

        if (izq.type === 'int' && der.type === 'int') {
            switch (node.op) {
                case '+':
                case '+=':
                    this.code.comment('Inicio + int')
                    this.code.add(r.T0, r.T1, r.T0);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'int', length: 4 });
                    this.code.comment('Fin + int')
                    break;
                    case '-':
                        case '-=':
                            this.code.comment('Inicio - int');
                            this.code.sub(r.T0, r.T1, r.T0);
                            this.code.push(r.T0);
                    this.code.pushObject({ type: 'int', length: 4 });
                    this.code.comment('Fin - int');
                    break;
                    case '*':
                        this.code.comment('Inicio * int');
                        this.code.mul(r.T0, r.T1, r.T0);
                        this.code.push(r.T0);
                        this.code.pushObject({ type: 'int', length: 4 });
                        this.code.comment('Fin * int');
                        break;
                    case '/':
                        this.code.comment('Inicio / int');
                        this.code.div(r.T0, r.T1, r.T0);
                        this.code.push(r.T0);
                        this.code.pushObject({ type: 'int', length: 4 });
                        this.code.comment('Fin / int');
                        break;
                    case '%':
                        this.code.comment('Inicio % int');
                        this.code.rem(r.T0, r.T1, r.T0);
                        this.code.push(r.T0);
                        this.code.pushObject({ type: 'int', length: 4 });
                        this.code.comment('Fin % int');
                        break;
                    case '==':
                        this.code.comment('Inicio == int');
                        this.code.xor(r.T0, r.T1, r.T0);
                        this.code.seqz(r.T0, r.T0);
                        this.code.push(r.T0);
                        this.code.pushObject({ type: 'boolean', length: 4 });
                        this.code.comment('Fin == int');
                        break;
                    case '!=':
                        this.code.comment('Inicio != int');
                        this.code.xor(r.T0, r.T1, r.T0);
                        this.code.snez(r.T0, r.T0);
                        this.code.push(r.T0);
                        this.code.pushObject({ type: 'boolean', length: 4 });
                        this.code.comment('Fin != int');
                        break;
                    case '>':
                        this.code.comment('Inicio > int');
                        this.code.slt(r.T0, r.T0, r.T1);
                        this.code.push(r.T0);
                        this.code.pushObject({ type: 'boolean', length: 4 });
                        this.code.comment('Fin > int');
                        break;
                    case '>=':
                        this.code.comment('Inicio >= int');
                        this.code.slt(r.T0, r.T1, r.T0);
                        this.code.xori(r.T0, r.T0, 1);
                        this.code.push(r.T0);
                        this.code.pushObject({ type: 'boolean', length: 4 });
                        this.code.comment('Fin >= int');
                        break;
                    case '<':
                        this.code.comment('Inicio < int');
                        this.code.slt(r.T0, r.T1, r.T0);
                        this.code.push(r.T0);
                        this.code.pushObject({ type: 'boolean', length: 4 });
                        this.code.comment('Fin < int');
                        break;
                    case '<=':
                        this.code.comment('Inicio <= int');
                        this.code.slt(r.T0, r.T0, r.T1);
                        this.code.xori(r.T0, r.T0, 1);
                        this.code.push(r.T0);
                        this.code.pushObject({ type: 'boolean', length: 4 });
                        this.code.comment('Fin <= int');
                        break;
                    default:
                            throw new Error(`Operación no soportada para enteros: ${node.op}`);
            }
            //return;
        }

        if (izq.type === 'char' && der.type === 'char') {
            switch (node.op) {
                case '==':
                    this.code.comment('Inicio de == char');
                    this.code.xor(r.T0, r.T1, r.T0);
                    this.code.seqz(r.T0, r.T0);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    this.code.comment('Fin de == char');
                    break;
                case '!=':
                    this.code.comment('Inicio de != char');
                    this.code.xor(r.T0, r.T1, r.T0);
                    this.code.snez(r.T0, r.T0);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    this.code.comment('Fin de != char');
                    break;
                case '>':
                    this.code.comment('Inicio de > char');
                    this.code.slt(r.T0, r.T0, r.T1);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    this.code.comment('Fin de > char');
                    break;
                case '>=':
                    this.code.comment('Inicio de >= char');
                    this.code.slt(r.T0, r.T1, r.T0);
                    this.code.xori(r.T0, r.T0, 1);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    this.code.comment('Fin de >= char');
                    break;
                case '<':
                    this.code.comment('Inicio de < char');
                    this.code.slt(r.T0, r.T1, r.T0);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    this.code.comment('Fin de < char');
                    break;
                case '<=':
                    this.code.comment('Inicio de <= char');
                    this.code.slt(r.T0, r.T0, r.T1);
                    this.code.xori(r.T0, r.T0, 1);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    this.code.comment('Fin de <= char');
                    break;
                default:
                    throw new Error(`Operación no soportada para char: ${node.op}`);
                }
        }
        this.code.comment('Fin de Operacion Binaria');
        }

    /**
     * @type {BaseVisitor['visitOperacionUnaria']}
     */
    visitOperacionUnaria(node) {
        node.datos.accept(this);
        const isIzqFloat = this.code.getTopObject().type === 'float';
        const valor = this.code.popObject(isIzqFloat ? f.FT1 : r.T1); // izq
        switch (node.op) {
            case '-':
                if (valor.type === 'int') {
                    this.code.comment('Inicio de - unario entero');
                    this.code.li(r.T1, 0);
                    this.code.sub(r.T0, r.T1, r.T0);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'int', length: 4 });
                    this.code.comment('Fin de - unario entero');
                } else if (valor.type === 'float') {
                    this.code.comment('Inicio de - unario float');
                    this.code.fneg(f.FT0, f.FT1);
                    this.code.pushFloat(f.FT0);
                    this.code.pushObject({ type: 'float', length: 4 });
                    this.code.comment('Fin de - unario float');                
                }
                break;
            case '++':
                if (valor.type === 'int') {
                    this.code.comment('Inicio de ++ entero');
                    this.code.addi(r.T0, r.T0, 1);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'int', length: 4 });
                    this.code.comment('Fin de ++ entero');
                } else if (node.datos.type === 'float') {
                    /*
                        this.code.fcvtsw(f.FT1, r.T1);
                        this.code.fmv(r.FT0, r.T0);
                        this.code.fli(r.FT1, 1.0);
                        this.code.fadd(r.FT0, r.FT0, r.FT1);
                        this.code.pushFloat(r.FT0);
                        this.code.pushObject({ type: 'float', length: 4 });
                    */
                    }
                    break;
            case '--':
                if (valor.type === 'int') {
                    this.code.comment('Inicio de -- entero');
                    this.code.addi(r.T0, r.T0, -1);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'int', length: 4 });
                    this.code.comment('Fin de -- entero');
                } else if (node.datos.type === 'float') {
                    /*
                    this.code.fcvtsw(f.FT1, r.T1);
                    this.code.fmv(r.FT0, r.T0);
                    this.code.fli(r.FT1, 1.0);
                    this.code.fsub(r.FT0, r.FT0, r.FT1);
                    this.code.pushFloat(r.FT0);
                    this.code.pushObject({ type: 'float', length: 4 });
                    */
                }
                break;
            case '!':
                if (valor.type === 'boolean') {
                    this.code.comment('Inicio de !');
                    this.code.li(r.T1, 1);
                    this.code.xor(r.T0, r.T0, r.T1);
                    this.code.push(r.T0);
                    this.code.pushObject({ type: 'boolean', length: 4 });
                    this.code.comment('Fin de !');
                }
                break;
        }
        return;
    }

    //////////////////////////////////////////// SENTENCIAS ////////////////////////////////////////////

    /**
     * @type {BaseVisitor['visitExpresionStmt']}
     */
    visitExpresionStmt(node) {
        this.code.comment('VisitExpresion');
        node.exp.accept(this);
        const valorfloat = this.code.getTopObject().type === 'float';
        this.code.popObject(valorfloat ? f.FT0 : r.T0);
        this.code.comment('Fin VisitExpresion');
    }
    /**
     * @type {BaseVisitor['visitDeclaracionVariable']}
     */
    visitDeclaracionVariable(node) {
        this.code.comment(`Declaración Variable: ${node.id}`);
        if (node.exp) {
            node.exp.accept(this);
            if (this.insideFunction) {
                const localObject = this.code.getFrameLocal(this.frameDclIndex);
                const valueObj = this.code.popObject(r.T0);

                this.code.addi(r.T1, r.FP, -localObject.offset * 4);
                this.code.sw(r.T0, r.T1);

                localObject.type = valueObj.type;
                this.frameDclIndex++;

                return
            }
        } else {
            switch (node.tipoVar) {
                case 'int':
                    this.code.pushContant({ type: 'int', valor: 0 });
                    break;
                case 'float':
                    this.code.pushContant({ type: 'float', valor: 0.0 });
                    break;
                case 'boolean':
                    this.code.pushContant({ type: 'boolean', valor: false });
                    break;
                case 'string':
                    this.code.pushContant({ type: 'string', valor: "" });
                    break;
                case 'char':
                    this.code.pushContant({ type: 'char', valor: '' });
                    break;
            }
        }
        this.code.tagObject(node.id);
        this.code.comment(`Fin declaración Variable: ${node.id} (Tipo inferido: ${node.tipoInferido})`);
    }

    /**
     * @type {BaseVisitor['visitReferenciaVariable']}
     */
    visitReferenciaVariable(node) {
        this.code.comment(`Referencia a variable ${node.id} `/* : ${JSON.stringify(this.code.objectStack)}`*/);
        const [offset, varObjeto] = this.code.getObject(node.id);
            const EsFlotante = varObjeto.type === 'float';
            if (this.insideFunction) {
                this.code.addi(r.T1, r.FP, -varObjeto.offset * 4);
                this.code.lw(r.T0, r.T1);
                this.code.push(r.T0);
                this.code.pushObject({ ...varObjeto, id: undefined });
                return
            }
            this.code.addi(r.T0, r.SP, offset);
            if (EsFlotante) {
                this.code.flw(f.FT0, r.T0);
                this.code.pushFloat(f.FT0);
            } else {
                this.code.lw(r.T1, r.T0);
                this.code.push(r.T1);
            }
            this.code.pushObject({ ...varObjeto, id: undefined });
        this.code.comment(`Fin referencia de variable ${node.id} `/*: ${JSON.stringify(this.code.objectStack)}`*/);
    }

    /**
     * @type {BaseVisitor['visitPrint']}
     */
    visitPrint(node) {
        this.code.comment('Inicio Print');
        const tipoPrint = {
            'int': () => this.code.printInt(),
            'string': () => this.code.printString(),
            'boolean': () => this.code.printBoolean(),
            'char': () => this.code.printChar(),
            'float': () => this.code.printFloat()
        }
        for (let i = 0; i < node.exps.length; i++) {
            node.exps[i].accept(this);
            const isFloat = this.code.getTopObject().type === 'float';
            console.log('isFloat', this.code.getTopObject());
            console.log('isFloat', this.code.getTopObject().type);
            const object = this.code.popObject(isFloat ? f.FA0 : r.A0);
            tipoPrint[object.type]();
        }
        this.code.printNewLine();
        this.code.comment('Fin Print');
    }

    /**
    * @type {BaseVisitor['visitAsignacionVariable']}
    */

    visitAsignacionVariable(node) {
        this.code.comment(`Inicio Asignacion Variable: ${node.id}`);
        node.exp.accept(this);
        if(this.code.getTopObject().type === "float") {  
            const valorObjeto = this.code.popObject(f.FT0)
            const [offset] = this.code.getObject(node.id)
            this.code.li(r.T1, offset)
            this.code.fcvtsw(f.FT1, r.T1)
            this.code.fcvtsw(f.FT2, r.SP)
            this.code.addi(r.T1, r.SP, offset)
            this.code.sw(r.T0, r.T1)
            this.code.fadd(f.FT1, f.FT2, f.FT1)
            this.code.fsw(f.FT0, r.T1)
            this.code.pushFloat(f.FT0)
            this.code.pushObject(valorObjeto)
            this.code.comment(`Fin Asignacion variable: ${node.id}`)
            return
        }
        const valorObjeto = this.code.popObject(r.T0);
        const [offset, variableObject] = this.code.getObject(node.id);
        if (this.insideFunction) {
            this.code.addi(r.T1, r.FP, -variableObject.offset * 4); // ! REVISAR
            this.code.sw(r.T0, r.T1); // ! revisar
            return
        }
        this.code.addi(r.T1, r.SP, offset);
        this.code.sw(r.T0, r.T1);
        variableObject.type = valorObjeto.type;
        this.code.push(r.T0);
        this.code.pushObject(valorObjeto);
        this.code.comment(`Fin Asignacion Variable: ${node.id}`);
    }

    //////////////////////////////////////////// MENORES AUXILIARES ////////////////////////////////////////////

    /**
     * @type {BaseVisitor['visitAgrupacion']}
     */
    visitAgrupacion(node) {
        this.code.comment('Inicio de agrupación');
        return node.exp.accept(this);
    }

    /**
     * @type {BaseVisitor['visitBloque']}
     */
    visitBloque(node) {
        this.code.comment('Inicio de bloque');

        this.code.newScope();

        node.instrucciones.forEach(instr => instr.accept(this));

        this.code.comment('Reduciendo la pila');
        const bytesToRemove = this.code.endScope();

        if (bytesToRemove > 0) {
            this.code.addi(r.SP, r.SP, bytesToRemove);
        }

        this.code.comment('Fin de bloque');
    }

    //////////////////////////////////////////// INSTRUCCIONES ////////////////////////////////////////////
    /**
     * @type {BaseVisitor['visitIf']}
     */
    visitIf(node) {
        this.code.comment('Inicio de If');
        node.cond.accept(this);
        this.code.popObject(r.T0);
        const hasElse = !!node.falso
        if (hasElse) {
            const elseLabel = this.code.getLabel();
            const endIfLabel = this.code.getLabel();
            this.code.beq(r.T0, r.ZERO, elseLabel);
            node.verdad.accept(this);
            this.code.j(endIfLabel);
            this.code.addLabel(elseLabel);
            node.falso.accept(this);
            this.code.addLabel(endIfLabel);
        } else {
            const endIfLabel = this.code.getLabel();
            this.code.beq(r.T0, r.ZERO, endIfLabel);
            node.verdad.accept(this);
            this.code.addLabel(endIfLabel);
        }
        this.code.comment('Fin del If');
    }

    /**
     * @type {BaseVisitor['visitWhile']}
     */
    visitWhile(node) {
        this.code.comment('Inicio de While');
        const startWhileLabel = this.code.getLabel();
        const prevContinueLabel = this.continueLabel;
        this.continueLabel = startWhileLabel;

        const endWhileLabel = this.code.getLabel();
        const prevBreakLabel = this.breakLabel;
        this.breakLabel = endWhileLabel;

        this.code.addLabel(startWhileLabel);
        this.code.comment('Inicio Condicion');
        node.cond.accept(this);
        this.code.popObject(r.T0);
        this.code.comment('Fin de condicion');
        this.code.beq(r.T0, r.ZERO, endWhileLabel);
        this.code.comment('Cuerpo del while');
        node.instrucciones.accept(this);
        this.code.j(startWhileLabel);
        this.code.addLabel(endWhileLabel);
        
        this.continueLabel = prevContinueLabel;
        this.breakLabel = prevBreakLabel;
        this.code.comment('Fin de While');
    }


    /**
     * @type {BaseVisitor['visitFor']}
     */

    visitFor(node) {
        this.code.comment('Inicio For');

        const startForLabel = this.code.getLabel();

        const endForLabel = this.code.getLabel();
        const prevBreakLabel = this.breakLabel;
        this.breakLabel = endForLabel;
    
        const incrementLabel = this.code.getLabel();
        const prevContinueLabel = this.continueLabel;
        this.continueLabel = incrementLabel;
    
        this.code.newScope();
    
        node.init.accept(this);
    
        this.code.addLabel(startForLabel);
        this.code.comment('Condicion');
        node.cond.accept(this);
        this.code.popObject(r.T0);
        this.code.comment('Fin de condicion');
        this.code.beq(r.T0, r.ZERO, endForLabel);
    
        this.code.comment('Cuerpo del for');
        node.sentencias.accept(this);
    
        this.code.addLabel(incrementLabel);
        node.inc.accept(this);
        this.code.popObject(r.T0);
        this.code.j(startForLabel);
    
        this.code.addLabel(endForLabel);
    
        this.code.comment('Reduciendo la pila');
        const bytesToRemove = this.code.endScope();
    
        if (bytesToRemove > 0) {
            this.code.addi(r.SP, r.SP, bytesToRemove);
        }
    
        this.continueLabel = prevContinueLabel;
        this.breakLabel = prevBreakLabel;
    
        this.code.comment('Fin de For');
    }

    /**
     * @type {BaseVisitor['visitForEach']}
     */
    visitForEach(node) {
        this.code.comment('Inicio Foreach');

        const InicioForLabel = this.code.getLabel();
        const ContinueLabelPrevio = this.continueLabel;
        this.continueLabel = InicioForLabel;

        const FinalForLabel = this.code.getLabel();
        const BreakLabelPrevio = this.breakLabel;
        this.breakLabel = FinalForLabel;

        const refArreglo = {id: node.id2};
        this.visitReferenciaVariable(refArreglo);

        const [x, ArregloObjeto] = this.code.getObject(node.id2);
        const length = ArregloObjeto.length / 4;

        this.code.li(r.T2, length);
        this.code.li(r.T5, 0);  
        this.code.newScope();
        this.code.tagObject(node.id);
        this.code.addLabel(InicioForLabel);
        this.code.slt(r.T0, r.T5, r.T2);
        this.code.beq(r.T0, r.ZERO, FinalForLabel);

        this.code.la(r.T4, node.id2);
        this.code.li(r.T3, 4);
        this.code.mul(r.T3, r.T5, r.T3);
        this.code.add(r.T4, r.T4, r.T3);
        this.code.lw(r.T0, r.T4);

        const [offset, a] = this.code.getObject(node.id);
        this.code.addi(r.T3, r.SP, offset);
        this.code.sw(r.T0, r.T3);

        node.sentencias.accept(this);

        this.code.addi(r.T5, r.T5, 1);
        this.code.j(InicioForLabel);
        this.code.addLabel(FinalForLabel);

        const BytesEliminados = this.code.endScope();
        if (BytesEliminados > 0) {
            this.code.addi(r.SP, r.SP, BytesEliminados);
        }

        this.continueLabel = ContinueLabelPrevio;
        this.breakLabel = BreakLabelPrevio;
        this.code.comment('Fin Foreach');
        }

    /**
     * @type {BaseVisitor['visitSwitch']}
     */
    visitSwitch(node) {
        this.code.comment('Inicio de Switch');
        
        node.expre.accept(this);
        this.code.popObject(r.T1);
        
        const endSwitchLabel = this.code.getLabel();
        const prevBreakLabel = this.breakLabel;
        this.breakLabel = endSwitchLabel;
        
        const casesLabels = node.cases.map(() => this.code.getLabel());
        const defaultLabel = node.def ? this.code.getLabel() : endSwitchLabel;
        
        node.cases.forEach((caseNode, index) => {
            caseNode.valor.accept(this);
            this.code.popObject(r.T0);
            this.code.beq(r.T1, r.T0, casesLabels[index]);
        });
        this.code.j(defaultLabel);
        
        node.cases.forEach((caseNode, index) => {
            this.code.addLabel(casesLabels[index]);
            caseNode.sentenciasBloque.forEach(sentencia => {
                sentencia.accept(this);
            });
        });
        
        if (node.def) {
            this.code.addLabel(defaultLabel);
            node.def.sentencias.forEach(sentencia => {
                sentencia.accept(this);
            });
        }
        
        this.code.addLabel(endSwitchLabel);
        this.breakLabel = prevBreakLabel;
        
        this.code.comment('Fin del Switch');
    }

    
    /**
     * @type {BaseVisitor['visitTernario']}
     */
    visitTernario(node) {
        this.code.comment('Inicio Ternario');
        node.condicion.accept(this);
        this.code.popObject(r.T0);
        const elseLabel = this.code.getLabel();
        const endLabel = this.code.getLabel();
        this.code.beq(r.T0, r.ZERO, elseLabel);
        node.verdadero.accept(this);
        this.code.j(endLabel);
        this.code.addLabel(elseLabel);
        node.falso.accept(this);
        this.code.addLabel(endLabel);
        this.code.comment('Fin Ternario');
    }

    //////////////////////////////////////////// TRANSFERENCIAS ////////////////////////////////////////////

    /**
     * @type {BaseVisitor['visitBreak']}
     */
    visitBreak(node) {
        this.code.comment('Inicio Break');
        if (this.breakLabel) {
            this.code.j(this.breakLabel);
        } else {
            this.code.comment('Error: break fuera de un bucle o switch');
        }
        this.code.comment('Fin Break');
    }

    /**
     * @type {BaseVisitor['visitContinue']}
     */
    visitContinue(node) {
        this.code.comment('Inicio Continue');
        this.code.j(this.continueLabel);
        this.code.comment('Fin Continue');
    }

    /**
     * @type {BaseVisitor['visitReturn']}
     */
    visitReturn(node) {
        this.code.comment('Inicio Return');

        if (node.exp) {
            node.exp.accept(this);
            this.code.popObject(r.A0);

            const frameSize = this.functionMetada[this.insideFunction].frameSize
            const returnOffest = frameSize - 1;
            this.code.addi(r.T0, r.FP, -returnOffest * 4)
            this.code.sw(r.A0, r.T0)
        }

        this.code.j(this.returnLabel);
        this.code.comment('Final Return');

    }

    //////////////////////////////////////////// FUNCIONES ////////////////////////////////////////////

    /**
         * @type {BaseVisitor['visitLlamada']}
         */
    visitLlamada(node) {
        if (!(node.call instanceof ReferenciaVariable)) return

        const nombreFuncion = node.call.id;

        this.code.comment(`Llamada a funcion ${nombreFuncion}`);


        // ---- LLamadas a funcion foraneas

        const etiquetaRetornoLlamada = this.code.getLabel();

        // 1. Guardar los argumentos
        this.code.addi(r.SP, r.SP, -4 * 2)
        node.argumentos.forEach((arg) => {
            arg.accept(this)
        });
        this.code.addi(r.SP, r.SP, 4 * (node.argumentos.length + 2))

        // Calcular la dirección del nuevo FP en T1
        this.code.addi(r.T1, r.SP, -4)

        // Guardar direccion de retorno
        this.code.la(r.T0, etiquetaRetornoLlamada)
        this.code.push(r.T0)

        // Guardar el FP
        this.code.push(r.FP)
        this.code.addi(r.FP, r.T1, 0)

        const frameSize = this.functionMetada[nombreFuncion].frameSize
        this.code.addi(r.SP, r.SP, -(frameSize - 2) * 4)


        // Saltar a la función
        this.code.j(nombreFuncion)
        this.code.addLabel(etiquetaRetornoLlamada)

        // Recuperar el valor de retorno
        const returnSize = frameSize - 1;
        this.code.addi(r.T0, r.FP, -returnSize * 4)
        this.code.lw(r.A0, r.T0)

        // Regresar el FP al contexto de ejecución anterior
        this.code.addi(r.T0, r.FP, -4)
        this.code.lw(r.FP, r.T0)

        // Regresar mi SP al contexto de ejecución anterior
        this.code.addi(r.SP, r.SP, frameSize * 4)


        this.code.push(r.A0)
        this.code.pushObject({ type: this.functionMetada[nombreFuncion].returnType, length: 4 })

        this.code.comment(`Fin de llamada a funcion ${nombreFuncion}`);
    }


    /**
     * @type {BaseVisitor['visitDeclaracionFuncion']}
     */
    visitDeclaracionFuncion(node) {
        const baseSize = 2;

        const paramSize = node.params.length;

        const frameVisitor = new frameFunc(baseSize + paramSize);
        node.bloque.accept(frameVisitor);
        const localFrame = frameVisitor.frameFunc;
        const localSize = localFrame.length;

        const returnSize = 1;

        const totalSize = baseSize + paramSize + localSize + returnSize;
        this.functionMetada[node.id] = {
            frameSize: totalSize,
            returnType: node.tipo,
        }

        const instruccionesDeMain = this.code.instrucciones;
        const instruccionesDeDeclaracionDeFuncion = []
        this.code.instrucciones = instruccionesDeDeclaracionDeFuncion;

        node.params.forEach((param, index) => {
            this.code.pushObject({
                id: param.id,
                type: param.tipo,
                length: 4,
                offset: baseSize + index
            })
        });

        localFrame.forEach(variableLocal => {
            this.code.pushObject({
                ...variableLocal,
                length: 4,
                type: 'local',
            })
        });

        this.insideFunction = node.id;
        this.frameDclIndex = 0;
        this.returnLabel = this.code.getLabel();

        this.code.comment(`Declaracion de funcion ${node.id}`);
        this.code.addLabel(node.id);

        node.bloque.accept(this);

        this.code.addLabel(this.returnLabel);

        this.code.add(r.T0, r.ZERO, r.FP);
        this.code.lw(r.RA, r.T0);
        this.code.jalr(r.ZERO, r.RA, 0);
        this.code.comment(`Fin de declaracion de funcion ${node.id}`);

        for (let i = 0; i < paramSize + localSize; i++) {
            this.code.objectStack.pop(); 
        }

        this.code.instrucciones = instruccionesDeMain

        instruccionesDeDeclaracionDeFuncion.forEach(instruccion => {
            this.code.instrucionesDeFunciones.push(instruccion);
        });
        this.insideFunction = false;
    }

    //////////////////////////////////////////// FUNCIONES NATIVAS ////////////////////////////////////////////

    /**
     * @type {BaseVisitor['visitParseInt']}
     */
    visitParseInt(node) {
        this.code.comment('Inicio de parseInt');
        node.Argumento.accept(this);
        this.code.popObject(r.A0);
        this.code.callBuiltin('parseInt');
        this.code.push(r.A0); 
        this.code.pushObject({ type: 'int', length: 4 });
        this.code.comment('Fin de parseInt');
    }

    /**
     * @type {BaseVisitor['visitParseFloat']}
     */

    visitParseFloat(node) {
        this.code.comment('Inicio de parseFloat');
        node.Argumento.accept(this);
        this.code.popObject(r.A0);
        this.code.callBuiltin('parseFloat');
        this.code.pushFloat(f.FT0)
        this.code.pushObject({ type: 'float', length: 4 });
        this.code.comment('Fin de parseFloat');
    }

    /**
     * @type {BaseVisitor['visitToString']}
     */
    visitToString(node) {
        this.code.comment('Inicio de toString');
        node.Argumento.accept(this);
        const esFlotante = this.code.getTopObject().type === 'float';
        const valor = this.code.popObject(esFlotante ? f.FA0 : r.A0);
        if (valor.type === 'float') {
            this.code.callBuiltin('floatToString');
        } else {
            if (valor.type === 'int') {
                this.code.li(r.A1, 1);
            } else if (valor.type === 'boolean') {
                this.code.li(r.A1, 2);
            } else if (valor.type === 'char') {
                this.code.li(r.A1, 3);
            } else if (valor.type === 'string') {
                this.code.li(r.A1, 4);
            }
            this.code.callBuiltin('toString');
        }
        this.code.pushObject({ type: 'string', length: 4})
        this.code.comment('Fin de toString');
    }

    /** 
     * @type {BaseVisitor['visitToLowerCase']}
     */

    visitToLowerCase(node) {
        this.code.comment('Inicio de toLowerCase');
        node.Argumento.accept(this);
        this.code.callBuiltin('toLowerCase');
        this.code.comment('Fin de toLowerCase');
    }

    /** 
     * @type {BaseVisitor['visitToUpperCase']}
     */
    visitToUpperCase(node) {
        this.code.comment('Inicio de toUpperCase');
        node.Argumento.accept(this);
        this.code.callBuiltin('toUpperCase');
        this.code.comment('Fin de toUpperCase');
    }

    /**
     * @type {BaseVisitor['visitTypeOf']}
     */

    visitTypeOf(node) {
        this.code.comment('Inicio de TypeOf');
        node.Argumento.accept(this);
        const EsFlotante = this.code.getTopObject().type === 'float';
        const valor = this.code.popObject(EsFlotante ? f.FT0 : r.T0);
        if (valor.type === 'int') {
            this.code.pushContant({ type: 'string', valor: 'int' });
        } else if (valor.type === 'float') {
            this.code.pushContant({ type: 'string', valor: 'float' });
        } else if (valor.type === 'char') {
            this.code.pushContant({ type: 'string', valor: 'char' });
        } else if (valor.type === 'boolean') {
            this.code.pushContant({ type: 'string', valor: 'boolean' });
        } else if (valor.type === 'string') {
            this.code.pushContant({ type: 'string', valor: 'string' });
        }
        this.code.pushObject({ type: 'string', length: 4 });
        this.code.comment('Fin de TypeOf');
        return
    }

    
    /**
     * @type {BaseVisitor['visitJoinArreglo']}
     */
    visitJoinArreglo(node) {
        // const startJoin = this.code.createLabel('startJoin');
        // const foundJoin = this.code.createLabel('foundJoin');
        // const notFoundJoin = this.code.createLabel('notFoundJoin');
        // const endJoin = this.code.createLabel('endJoin');
        // const isIzqFloat = this.code.getTopObject().type === 'float';
        // this.code.addLabel(startJoin);
        // this.code.li(r.T4, node.id); 
        // this.code.beq(r.T3, r.T4, notFoundJoin);
        // if (!isIzqFloat) {
        //     this.code.lw(r.T2, r.T5);
        //     this.code.beq(r.T1, r.T2, foundJoin);
        // } else {
        //     this.code.flw(f.FT2, r.T5);
        //     this.code.feq(f.FT3, f.FT1, f.FT2);
        //     this.code.bnez(f.FT3, foundJoin);
        // }
        // this.code.addi(r.T5, r.T5, 4);
        // this.code.addi(r.T3, r.T3, 1);
        // this.code.j(startJoin);
        // this.code.addLabel(foundJoin);
        // this.code.push(r.T3);
        // this.code.j(endJoin);
        // this.code.addLabel(notFoundJoin);
        // this.code.li(r.T3, -1);
        // this.code.push(r.T3);
        // this.code.addLabel(endJoin);
    }

    /**
     * @type {BaseVisitor['visitLengthArreglo']}
     */
    visitLengthArreglo(node) {
        this.code.comment('Inicio Length Arreglo');
        const [offset, varObjeto] = this.code.getObject(node.id);
        const NumeroElemntos = varObjeto.length / 4;
        this.code.la(r.T5, node.id);
        this.code.li(r.T1, NumeroElemntos);
        this.code.push(r.T1);
        this.code.pushObject({ type: 'int', length: 4 });
        this.code.comment('Fin Length Arreglo');
    }

    // //////////////////////////////////////////// ARREGLOS ////////////////////////////////////////////
    /**
         * @type {BaseVisitor['visitDeclaracionArreglo']}
         */ 
    visitDeclaracionArreglo(node) {
        this.code.comment('Inicio Declaracion Arreglo con inicializacion de valores');
        this.code.la(r.T5, node.id);

        const valores = node.valores;

        valores.forEach((valor, index) => {
            valor.accept(this);
            this.code.popObject(r.T0);
            this.code.sw(r.T0, r.T5, index * 4);
        });

        this.code.NuevoArreglo(node.id, node.tipo, valores.length);
        this.code.pushObject({ type: node.tipo, length: valores.length*4});
        this.code.tagObject(node.id);
        
        this.code.comment('Fin Declaracion Arreglo con inicializacion de valores');
    }

    /**
     * @type {BaseVisitor['visitDeclaracion2Arreglo']}
     */ 
    visitDeclaracion2Arreglo(node) {
        this.code.comment('Inicio Declaracion Arreglo reservando espacio');

        const nombre = node.id;
        const tipo = node.tipo1;
        const tamano = node.numero.accept(this);

        this.code.NuevoArreglo(nombre, tipo, tamano);

        this.code.la(r.T5, nombre);

        let ValorPorDefecto;
        switch (tipo) {
            case 'int':
                ValorPorDefecto = 0;
                break;
            case 'float':
                ValorPorDefecto = 0.0;
                break;
            case 'boolean':
                ValorPorDefecto = false;
                break;
            case 'string':
                ValorPorDefecto = "";
                break;
            case 'char':
                ValorPorDefecto = '';
                break;
        }

        this.code.li(r.T0, ValorPorDefecto);
        for (let i = 0; i < tamano; i++) {
            this.code.sw(r.T0, r.T5, i * 4);
        }

        this.code.pushObject({ type: tipo, length: tamano * 4 });
        this.code.tagObject(nombre);

        this.code.comment('Fin Declaracion Arreglo reservando espacio');
    }

    /**
     * @type {BaseVisitor['visitDeclaracion3Arreglo']}
     */ 
    visitDeclaracion3Arreglo(node) {
        this.code.comment('Inicio Declaracion por copia');
        const NombreArreglo1 = node.id1;
        const TipoArreglo = node.tipo;
        const NombreArreglo2 = node.id2;
        const [offset, varObjeto] = this.code.getObject(node.id2);

        this.code.li(r.T1, varObjeto.length);
        this.code.la(r.T0, NombreArreglo2);

        this.code.NuevoArreglo(NombreArreglo1, TipoArreglo, varObjeto.length/4);
        this.code.la(r.T2, NombreArreglo1);
        this.code.li(r.T3, 0);  
        
        const BucleLabel = this.code.getLabel();
        const FinalLabel = this.code.getLabel();

        this.code.addLabel(BucleLabel);
        this.code.beq(r.T3, r.T1, FinalLabel);

        this.code.lw(r.T4, r.T0, 0);
        this.code.sw(r.T4, r.T2, 0);

        this.code.addi(r.T3, r.T3, 1);
        this.code.addi(r.T0, r.T0, 4);
        this.code.addi(r.T2, r.T2, 4);

        this.code.j(BucleLabel);
        this.code.addLabel(FinalLabel);

        this.code.pushObject({ type: TipoArreglo, length: varObjeto.length});
        this.code.tagObject(NombreArreglo1);

        this.code.comment('Fin Declaracion por copia');
    }

    /**
         * @type {BaseVisitor['visitAccesoArreglo']}
         */
    visitAccesoArreglo(node) {
        this.code.comment('Inicio Acceso Arreglo');
        node.index.accept(this);
        this.code.popObject(r.T0);

        const [x, arrayObject] = this.code.getObject(node.id);

        this.code.la(r.T5, node.id);
        this.code.li(r.T1,4);   

        this.code.mul(r.T0, r.T0, r.T1);

        this.code.add(r.T2, r.T5, r.T0);

        this.code.lw(r.T3,r.T2,0);

        this.code.push(r.T3);

        this.code.pushObject({ ...arrayObject, id: undefined });
        this.code.comment('Fin Acceso Arreglo');

    }

    /**
     * @type {BaseVisitor['visitAsignacionArreglo']}
     */
    visitAsignacionArreglo(node) {
        this.code.comment('Inicio Asignacion Arreglo');

        node.valor.accept(this);
        node.index.accept(this);

        const datoObjeto = this.code.popObject(r.T0)
        const indexObject = this.code.popObject(r.T1)
        const [offset, variableO] = this.code.getObject(node.id)

        this.code.la(r.T5, node.id)

        this.code.li(r.T2, 4)

        this.code.mul(r.T0, r.T0, r.T2)

        this.code.add(r.T3, r.T5, r.T0)

        this.code.sw(r.T1, r.T3)

        this.code.push(r.T1)

        this.code.pushObject(datoObjeto)

        this.code.comment('Fin Asignacion Variable');

    }    

    /**
     * @type {BaseVisitor['visitIndexArreglo']}
     */
    visitIndexArreglo(node) {
        this.code.comment('Inicio IndexOf Arreglo');
        const Objeto = this.code.getObject(node.id);  
        node.index.accept(this);
        const EsFlotante = this.code.getTopObject().type === "float"
        this.code.popObject( EsFlotante ? f.FT1 : r.T1)
        const IncioBucle1Label = this.code.getLabel()
        const FinalBucleLabel = this.code.getLabel()
        const IndexBusquedaLabel = this.code.getLabel()
        const IndexNoEncontradoLabel = this.code.getLabel()
        this.code.la(r.T5, Objeto[1].id)
        this.code.li(r.T2, Objeto[1].length / 4)
        this.code.li(r.T3, 0)
        
        this.code.comment('Incio Busqueda Elemnto')
        if(EsFlotante) {
            this.code.addLabel(IncioBucle1Label)
            this.code.beq(r.T2, r.ZERO, IndexNoEncontradoLabel)
            this.code.flw(f.FT2, r.T5, 0)
            this.code.feq(r.T0, f.FT1, f.FT2)
            this.code.bnez(r.T0, IndexBusquedaLabel)
            this.code.addi(r.T5, r.T5, 4)
            this.code.addi(r.T3, r.T3, 1)
            this.code.addi(r.T2, r.T2, -1)
            this.code.j(IncioBucle1Label)
            this.code.addLabel(IndexBusquedaLabel)
            this.code.push(r.T3)
            this.code.j(FinalBucleLabel)
            this.code.addLabel(IndexNoEncontradoLabel)
            this.code.li(r.T0, -1)
            this.code.push(r.T0)
        }else {
            this.code.addLabel(IncioBucle1Label)
            this.code.beq(r.T2, r.ZERO, IndexNoEncontradoLabel)
            this.code.lw(r.T4, r.T5, 0)
            this.code.beq(r.T4, r.T1, IndexBusquedaLabel)
            this.code.addi(r.T5, r.T5, 4)
            this.code.addi(r.T3, r.T3, 1)
            this.code.addi(r.T2, r.T2, -1)
            this.code.j(IncioBucle1Label)
            this.code.addLabel(IndexBusquedaLabel)
            this.code.push(r.T3)
            this.code.j(FinalBucleLabel)
            this.code.addLabel(IndexNoEncontradoLabel)
            this.code.li(r.T0, -1)
            this.code.push(r.T0)
        }
        this.code.comment('Fin Busqueda Elemnto')
        this.code.addLabel(FinalBucleLabel)
        this.code.pushObject({ type: 'int', length: 4 });
        this.code.comment('Fin Index Arreglo')

    }
}



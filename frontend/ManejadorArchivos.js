let lastAST = null;
import { parse } from '../backend/Analizador.js';
import { CompilerVisitor } from '../backend/Compiler.js';
import { InterpreterVisitor } from '../backend/Interprete.js'
import { mostrarTablaSimbolos } from '../backend/oakLand/Entorno/TablaSimbolos.js';

export function inicializarManejadorArchivos() {
    const txtEntrada = document.getElementById('txtEntrada');
    const txtSalida = document.getElementById('txtSalida');
    const fileInput = document.getElementById('fileInput');
    const abrirArchivo = document.getElementById('abrirArchivo');
    const nuevoArchivo = document.getElementById('nuevoArchivo');
    const guardarArchivo = document.getElementById('guardarArchivo');
    const descargarArchivo = document.getElementById('descargarArchivo');
    const tablaSimbolos = document.getElementById('tablaSimbolos');

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file && file.name.endsWith('.oak')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                txtEntrada.value = e.target.result;
                actualizarNumLineas(txtEntrada, document.getElementById('nlEntrada'));
            };
            reader.readAsText(file);
        } else {
            alert('Por favor, seleccione un archivo con la extensión .oak.');
        }
    }

    function guardarArchivoContent(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    }

    function handleNewFile() {
        if (txtEntrada.value.trim() !== "") {
            const shouldSave = confirm("¿Desea guardar el archivo actual antes de crear uno nuevo?");
            if (shouldSave) {
                handleSaveFile();
            }
        }
        txtEntrada.value = "";
        txtSalida.value = "";
        actualizarNumLineas(txtEntrada, document.getElementById('nlEntrada'));
        actualizarNumLineas(txtSalida, document.getElementById('nlSalida'));
    }

    function handleSaveFile() {
        const filename = prompt("Ingrese el nombre del archivo (con la extensión .oak):", "ArchivoGuardado.oak");
        if (filename) {
            guardarArchivoContent(txtEntrada.value, filename);
        }
    }

    function handleFile(event) {
        event.preventDefault(); // Prevenir cualquier comportamiento por defecto
        
        if (txtSalida.value.trim() !== "") {
            const shouldSave = confirm("¿Desea Descargar la salida con extension .s?");
            if (shouldSave) {
                const filename = prompt("Ingrese el nombre del archivo (con la extensión .s):", "ArchivoGuardado.s");
                if (filename) {
                    const contenido = txtSalida.value; // Guardar el contenido en una variable
                    
                    // Usar setTimeout para asegurarnos de que la descarga ocurra después
                    setTimeout(() => {
                        const blob = new Blob([contenido], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.style.display = 'none';
                        link.href = url;
                        link.download = filename;
                        
                        document.body.appendChild(link);
                        link.click();
                        
                        // Limpiar
                        setTimeout(() => {
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                        }, 100);
                    }, 0);
                }
            }
        }
    }

    function actualizarNumLineas(textarea, lineNumbers) {
        const lines = textarea.value.split('\n').length;
        lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
    }

    // Event Listeners
    abrirArchivo.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    nuevoArchivo.addEventListener('click', handleNewFile);
    guardarArchivo.addEventListener('click', handleSaveFile);
    descargarArchivo.addEventListener('click', handleFile);
}

export function inicializarInterprete() {
    const txtEntrada = document.getElementById('txtEntrada');
    const txtSalida = document.getElementById('txtSalida');
    const nlEntrada = document.getElementById('nlEntrada');
    const nlSalida = document.getElementById('nlSalida');
    const btnEjecutar = document.getElementById('btnEjecutar');
    const tablaSimbolosBtn = document.getElementById('tablaSimbolos');
    const tablaErroresBtn = document.getElementById('tablaErrores');
    const descargarArchivo = document.getElementById('descargarArchivo');

    if (!txtEntrada || !txtSalida || !nlEntrada || !nlSalida || !btnEjecutar || !tablaSimbolosBtn || !tablaErroresBtn || !descargarArchivo) {
        console.error("Uno o más elementos necesarios no se encontraron en el DOM");
        return;
    }

    function actualizarNumLineas(textarea, lineNumbers) {
        const lines = textarea.value.split('\n').length;
        lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
    }

    function syncScroll(textarea, lineNumbers) {
        lineNumbers.scrollTop = textarea.scrollTop;
    }

    function handleInput() {
        actualizarNumLineas(txtEntrada, nlEntrada);
        actualizarNumLineas(txtSalida, nlSalida);
    }

    function obtenerEntorno() {
        return interprete.entorno;
    }

    function mostrarTablaSimbolos() {
        const codigo = txtEntrada.value;
        let tablaHTML = '<table border="1"><tr><th>Entorno</th><th>Variable</th><th>Tipo</th><th>Valor</th><th>Línea</th><th>Columna</th><th>Detalle</th></tr>';
        
        try {
            const sentencias = parse(codigo);
            let entornoGlobal = {};
            let entornoActual = entornoGlobal;
            let nivelEntorno = 0;
    
            function agregarFila(entorno, variable, tipo, valor, linea, columna, detalle) {
                tablaHTML += `<tr>
                    <td>${entorno}</td>
                    <td>${variable}</td>
                    <td>${tipo}</td>
                    <td>${valor !== undefined ? JSON.stringify(valor) : 'no asignado'}</td>
                    <td>${linea}</td>
                    <td>${columna}</td>
                    <td>${detalle}</td>
                </tr>`;
            }
    
            function obtenerValorVariable(id) {
                return entornoActual[id]?.valor;
            }
    
            function procesarSentencias(sentencias, nivel) {
                sentencias.forEach(sentencia => {
                    const entorno = nivel === 0 ? 'Global' : `Bloque ${nivel}`;
                    const linea = sentencia.location?.start?.line || '-';
                    const columna = sentencia.location?.start?.column || '-';
                    
                    if (sentencia.tipoVar && sentencia.id) {
                        // DeclaracionVariable
                        const valor = sentencia.exp ? sentencia.exp.valor : undefined;
                        entornoActual[sentencia.id] = { tipo: sentencia.tipoVar, valor: valor };
                        agregarFila(entorno, sentencia.id, sentencia.tipoVar, valor, linea, columna, `Variable '${sentencia.id}' ${nivel === 0 ? 'global' : 'local'} declarada`);
                    } else if (sentencia.id && sentencia.exp) {
                        // AsignacionVariable
                        entornoActual[sentencia.id].valor = sentencia.exp.valor;
                        agregarFila(entorno, sentencia.id, entornoActual[sentencia.id].tipo, sentencia.exp.valor, linea, columna, `Asignación de '${sentencia.id} = ${sentencia.exp.valor}'`);
                    } else if (sentencia.exps) {
                        // Print
                        const exp = sentencia.exps[0];
                        let valor, detalle;
                        if (exp.id) {
                            valor = obtenerValorVariable(exp.id);
                            detalle = `print(${exp.id}); imprime el valor ${JSON.stringify(valor)}`;
                        } else if (exp.valor !== undefined) {
                            valor = exp.valor;
                            detalle = `print(${JSON.stringify(valor)}); imprime el valor literal`;
                        } else {
                            valor = "desconocido";
                            detalle = `print(...); expresión no reconocida`;
                        }
                        agregarFila(entorno, '-', '-', valor, linea, columna, detalle);
                    } else if (sentencia.instrucciones) {
                        // Bloque
                        nivelEntorno++;
                        const entornoAnterior = entornoActual;
                        entornoActual = Object.create(entornoAnterior);
                        procesarSentencias(sentencia.instrucciones, nivelEntorno);
                        entornoActual = entornoAnterior;
                        nivelEntorno--;
                        agregarFila(entorno, '-', '-', '-', linea, columna, `Salimos del bloque ${nivelEntorno + 1}`);
                    }
                });
            }
    
            procesarSentencias(sentencias, nivelEntorno);
        } catch (error) {
            console.error("Error al parsear el código:", error);
            tablaHTML += `<tr><td colspan="7">Error al generar la tabla de símbolos: ${error.message}</td></tr>`;
        }
        
        tablaHTML += '</table>';
        
        // Crear una ventana emergente para mostrar la tabla
        const ventanaEmergente = window.open('', 'Tabla de Símbolos', 'width=1200,height=600');
        ventanaEmergente.document.write(`
            <html>
            <head>
                <title>Tabla de Símbolos</title>
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid black; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h2>Tabla de Símbolos</h2>
                ${tablaHTML}
            </body>
            </html>
        `);
        ventanaEmergente.document.close();
    }

    function mostrarTablaErrores() {
        const codigo = txtEntrada.value;
        let tablaHTML = '<table border="1"><tr><th>Tipo de Error</th><th>Descripción</th><th>Línea</th><th>Columna</th><th>Contexto</th></tr>';
        
        try {
            const sentencias = parse(codigo);
            let errores = [];
    
            function agregarError(tipo, descripcion, linea, columna, contexto) {
                errores.push({ tipo, descripcion, linea, columna, contexto });
            }
    
            function procesarSentencias(sentencias, contexto = 'Global') {
                sentencias.forEach(sentencia => {
                    const linea = sentencia.location?.start?.line || '-';
                    const columna = sentencia.location?.start?.column || '-';
                    
                    // Aquí puedes agregar lógica para detectar errores específicos
                    // Por ejemplo:
                    if (sentencia.tipoVar && sentencia.id) {
                        // Verificar si la variable ya está declarada
                        if (variableYaDeclarada(sentencia.id)) {
                            agregarError('Semántico', `Variable '${sentencia.id}' ya declarada`, linea, columna, contexto);
                        }
                    } else if (sentencia.id && !variableDeclarada(sentencia.id)) {
                        agregarError('Semántico', `Variable '${sentencia.id}' no declarada`, linea, columna, contexto);
                    }
                    
                    // Procesar bloques anidados
                    if (sentencia.instrucciones) {
                        procesarSentencias(sentencia.instrucciones, `Bloque en ${linea}:${columna}`);
                    }
                    
                    // Aquí puedes agregar más verificaciones según tus necesidades
                });
            }
    
            procesarSentencias(sentencias);
    
            // Generar tabla HTML de errores
            errores.forEach(error => {
                tablaHTML += `<tr>
                    <td>${error.tipo}</td>
                    <td>${error.descripcion}</td>
                    <td>${error.linea}</td>
                    <td>${error.columna}</td>
                    <td>${error.contexto}</td>
                </tr>`;
            });
    
        } catch (error) {
            console.error("Error al parsear el código:", error);
            tablaHTML += `<tr><td colspan="5">Error al generar la tabla de errores: ${error.message}</td></tr>`;
        }
        
        tablaHTML += '</table>';
        
        // Crear una ventana emergente para mostrar la tabla
        const ventanaEmergente = window.open('', 'Tabla de Errores', 'width=1000,height=600');
        ventanaEmergente.document.write(`
            <html>
            <head>
                <title>Tabla de Errores</title>
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid black; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h2>Tabla de Errores</h2>
                ${tablaHTML}
            </body>
            </html>
        `);
        ventanaEmergente.document.close();
    }
    
    // Funciones auxiliares (debes implementarlas según tu lógica específica)
    function variableYaDeclarada(id) {
        // Implementa la lógica para verificar si una variable ya está declarada
    }
    
    function variableDeclarada(id) {
        // Implementa la lógica para verificar si una variable está declarada
    }
    function ejecutarCodigo() {
        txtSalida.value = "";
        const codigo = txtEntrada.value;
        const interprete = new InterpreterVisitor();
        const compilador = new CompilerVisitor();

        let sentencias;

        try {
            sentencias = parse(codigo);
        } catch (error) {
            txtSalida.value = "Error Léxico-Sintáctico: " + error.message;
            console.log("-----------------------");
            console.log(error);
            console.log("-----------------------");
            const { line: linea, column: columna } = error.location.start;
            ListaErrores.push({
                descripcion: error.message,
                linea: linea,
                columna: columna,
            });
            return;
        }

        for (let i = 0; i < sentencias.length; i++) {
            const sentencia = sentencias[i];
            try {
                sentencia.accept(interprete);
            } catch (error) {
                txtSalida.value = "Error Semántico: " + error.message;
                console.log("-----------------------");
                console.log(error);
                console.log("-----------------------");
                const { line: linea, column: columna } = sentencia.location.start;
                ListaErrores.push({
                    descripcion: error.message,
                    linea: linea,
                    columna: columna,
                });
                return;
            }
        }

        for (let i = 0; i < sentencias.length; i++) {
            const sentencia = sentencias[i];
            try {
                sentencia.accept(compilador);
            } catch (error) {
                txtSalida.value = "Error Código Intermedio: " + error.message;
                console.log("-----------------------");
                console.log(error);
                console.log("-----------------------");
                return;
            }
        }
        txtSalida.value = compilador.code.toString();
        actualizarNumLineas(txtSalida, nlSalida);
    }
    
    // function ejecutarCodigo() {
    //     const codigo = txtEntrada.value;
    //     txtSalida.value = '';  // Limpiar antes de comenzar
        
    //     try {
    //         const sentencias = parse(codigo);
    //         const interprete = new CompilerVisitor();
            
    //         sentencias.forEach(sentencia => {
    //             try {
    //                 sentencia.accept(interprete);
    //                 // Añadir la salida acumulada del intérprete después de cada sentencia
    //                 if (interprete.salida !== '') {
    //                     txtSalida.value += interprete.salida;
    //                     interprete.salida = ''; // Limpiar la salida del intérprete después de usarla
    //                 }
    //             } catch (errorSentencia) {
    //                 txtSalida.value += `Error en línea ${sentencia.location.start.line}: ${errorSentencia.message}\n`;
    //                 console.error("Error en sentencia:", errorSentencia);
    //             }
    //         });
    
    //         console.log({sentencias});
    //     } catch (error) {
    //         if (error.location) {
    //             txtSalida.value += `Error en línea ${error.location.start.line}: ${error.message}\n`;
    //         } else {
    //             txtSalida.value += "Error general: " + error.message + "\n";
    //         }
    //         console.error("Error general:", error);
    //     }
    
    //     actualizarNumLineas(txtSalida, nlSalida);
    // }
    
    txtEntrada.addEventListener('input', handleInput);
    txtEntrada.addEventListener('scroll', () => syncScroll(txtEntrada, nlEntrada));
    txtSalida.addEventListener('scroll', () => syncScroll(txtSalida, nlSalida));
    btnEjecutar.addEventListener('click', ejecutarCodigo);
    tablaSimbolosBtn.addEventListener('click', mostrarTablaSimbolos);
    tablaErroresBtn.addEventListener('click', mostrarTablaErrores);


    handleInput();
}

export function obtenerAST() {
    return lastAST;
}
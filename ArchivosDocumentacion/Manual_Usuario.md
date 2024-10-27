# Organizacion de Lenguajes y Compiladores 2 -N-
## Proyecto 2
### Segundo Semestre 2024
```js
Universidad San Carlos de Guatemala
Programador: Pablo Andres Rodriguez Lima
Carne: 202201947
Correo: pabloa10rodriguez@gmail.com
```
---
## Descripción del Proyecto
El Compilador para el lenguaje de programación OakLand ha sido desarrollado. Este lenguaje, inspirado en la sintaxis de Java, se destaca por su capacidad para manejar múltiples paradigmas de programación, incluyendo la orientación a objetos, la programación funcional y la procedimental. Se ha implementado también una plataforma sencilla pero robusta, que permite crear, abrir, editar y compilar código escrito en OakLand de manera eficiente.

Para aprovechar al máximo nuestro programa, asegúrate de cumplir con los siguientes requisitos mínimos:

## Objetivos
* Objetivo General:
    * Desarrollar y presentar un programa de software integral que permite usar una interfaz grafica para abrir, guardar y revisar errores semanticos.

* Objetivos Específicos:
    * Crear una interfaz de usuario amigable que permita a los usuarios gestionar proyectos de manera efectiva.
    * Desarrollar funcionalidades que permitan visualizar los errores.

---
## Como usar el programa
Para utilizar nuestro programa, primero debes acceder a 'https://pablor03.github.io/OLC2_Proyecto2_202201947/frontend/' desde nuestro repositorio de GitHub. Una vez habilitado en tu navegador, puedes abrirlo en tu IDE o editor de texto preferido. A continuación, te explicaremos cómo utilizar nuestro programa.

### Interfaz gráfica
Una vez que hayas abierto nuestro programa, verás una interfaz gráfica como la siguiente:

![alt text](image-7.png)

### Botones
En la parte superior de la interfaz gráfica, encontrarás una barra de menú con los siguientes botones: Ejecutar, Archivo y Reportes. A continuación, te explicaremos para qué sirve cada uno de ellos.

#### Ejecutar
Este botón te permite ejecutar el código que has escrito en el cuadro de texto que se encuentra en la parte inferior de la interfaz gráfica. Una vez que hayas ejecutado el código, podrás ver los resultados en la consola que se encuentra en la parte inferior de la interfaz gráfica.
![alt text](image-8.png)

![alt text](image-9.png)
##### Archivo
Este boton te permite Abrir, Crear y Guardar un archivo con la extension .oak. Una vez que hayas creado el archivo, podrás editarlo en el cuadro de texto que se encuentra en la parte inferior de la interfaz gráfica.
![alt text](image-10.png)

- ###### Abrir
Este botón te permite abrir un archivo con la extensión .oak. Una vez que hayas abierto el archivo, podrás editarlo en el cuadro de texto que se encuentra en la parte inferior de la interfaz gráfica.
![alt text](image-11.png)

- ###### Crear
Este botón te permite crear un archivo con la extensión .oak. Una vez que hayas creado el archivo, podrás editarlo en el cuadro de texto que se encuentra en la parte inferior de la interfaz gráfica.
![alt text](image-12.png)

- ###### Guardar
Este botón te permite guardar el archivo que estás editando en el cuadro de texto que se encuentra en la parte inferior de la interfaz gráfica. Una vez que hayas guardado el archivo, podrás abrirlo en el futuro y editarlo en el cuadro de texto que se encuentra en la parte inferior de la interfaz gráfica.
![alt text](image-13.png)

- ###### Guardar Salida
Este botón te permite guardar la salida que se ha generado al ejecutar el código que has escrito en el cuadro de texto que se encuentra en la parte inferior de la interfaz gráfica. Una vez que hayas ejecutado el código, podrás guardar la salida en un archivo con la extensión .s .
![alt text](image-14.png)

##### Reportes

- ###### Errores
Este botón te permite ver los reportes de errores que se han generado al ejecutar el código que has escrito en el cuadro de texto que se encuentra en la parte inferior de la interfaz gráfica. Una vez que hayas ejecutado el código, podrás ver los reportes de errores en una ventana emergente.
![alt text](image-16.png)

- ###### Tabla de Simbolos
Este botón te permite ver la tabla de símbolos que se ha generado al ejecutar el código que has escrito en el cuadro de texto que se encuentra en la parte inferior de la interfaz gráfica. Una vez que hayas ejecutado el código, podrás ver la tabla de símbolos en una ventana emergente.
![alt text](image-15.png)

A continuacion te dejo unas cadenas simples de entrada con la cual te familiarizaras con el programa.

```java
//Cadena de entrada 1
int a = 5;
int b = 10;
int c = a + b;
System.out.println(c);
// Salida esperada: 
// .data

//                     true_cadena: .string "true"
//                     false_cadena: .string "false"
//                 heap:
//                     .text
//                     # inicializando El Heap Pointer
//                     la t6, heap
//             main:
//             # Declaración Variable: a 
// # Tipo de dato Numero 5 
// li t0, 5
// addi sp, sp, -4
// sw t0, 0(sp)
// # Fin Numero 
// # Fin declaración Variable: a (Tipo inferido: undefined) 
// # Declaración Variable: b 
// # Tipo de dato Numero 10 
// li t0, 10
// addi sp, sp, -4
// sw t0, 0(sp)
// # Fin Numero 
// # Fin declaración Variable: b (Tipo inferido: undefined) 
// # Declaración Variable: c 
// # Operacion Binaria: + 
// # Referencia a variable a  
// addi t0, sp, 4
// lw t1, 0(t0)
// addi sp, sp, -4
// sw t1, 0(sp)
// # Fin referencia de variable a  
// # Referencia a variable b  
// addi t0, sp, 4
// lw t1, 0(t0)
// addi sp, sp, -4
// sw t1, 0(sp)
// # Fin referencia de variable b  
// lw t0, 0(sp)
// addi sp, sp, 4
// lw t1, 0(sp)
// addi sp, sp, 4
// # Inicio + int 
// add t0, t1, t0
// addi sp, sp, -4
// sw t0, 0(sp)
// # Fin + int 
// # Fin de Operacion Binaria 
// # Fin declaración Variable: c (Tipo inferido: undefined) 
// # Inicio Print 
// # Referencia a variable c  
// addi t0, sp, 0
// lw t1, 0(t0)
// addi sp, sp, -4
// sw t1, 0(sp)
// # Fin referencia de variable c  
// lw a0, 0(sp)
// addi sp, sp, 4
// li a7, 1
// ecall 
// li a0, 10
// li a7, 11
// ecall 
// # Fin Print 
// # Fin Programa 
// li a7, 10
// ecall 
// # Constructores 
// # Funciones 
```
```java
//Cadena de entrada 2
System.out.println("********** Funciones no recursivas sin parámetros **********");
System.out.println("1. void");
void saludar() {
    System.out.println("Hola");
}
saludar();
System.out.println("");
System.out.println("2. Con retorno");
int sumar() {
    return 10 + 20;
}
System.out.println(sumar());
// Salida esperada: Hola, 30
```

---
Para obtener más información sobre cómo implementar nuestro programa, consulta el manual Tecnico puedes acceder a https://github.com/PabloR03/OLC2_Proyecto2_202201947/blob/main/ArchivosDocumentacion/Manual_Tecnico.md

Archivos de Prueba adicionales: https://github.com/damianpeaf/OLC2_2S2024/tree/main/archivos-entrada/proyecto2 
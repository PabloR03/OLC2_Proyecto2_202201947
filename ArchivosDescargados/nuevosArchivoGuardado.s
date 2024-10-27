.data
                        heap:
                .text
                # Inicializando el heap pointer
                    la t6, heap
                main:
                    # Operacion: + 
# Primitivo Entero: 7 
li t0, 7
addi sp, sp, -4
sw t0, 0(sp)
# Fin Primitivo: 7 
# Primitivo Entero: 8 
li t0, 8
addi sp, sp, -4
sw t0, 0(sp)
# Fin Primitivo: 8 
lw t0, 0(sp)
addi sp, sp, 4
lw t1, 0(sp)
addi sp, sp, 4
add t0, t1, t0
addi sp, sp, -4
sw t0, 0(sp)
lw a0, 0(sp)
addi sp, sp, 4
li a7, 1
ecall 
li a0, 10
li a7, 11
ecall 
li a7, 10
ecall 
            
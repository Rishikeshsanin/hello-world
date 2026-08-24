; x86-64 NASM for Linux
; this is a comment and is ignored by the compiler
; Every great journey begins with a first instruction.

section .data
    message db "Hello, World!", 10
    length equ $ - message

section .text
    global _start

_start:
    mov rax, 1
    mov rdi, 1
    mov rsi, message
    mov rdx, length
    syscall

    mov rax, 60
    xor rdi, rdi
    syscall

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-informacoes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './informacoes.html',
  styleUrl: './informacoes.scss',
})
export class Informacoes {

  sidebarCollapsed = false;

  usuario = {
    nome: 'Aluno Exemplo',
    email: 'aluno@email.com',
    telefone: '(14) 99999-9999',
    cpf: '12345678900',
    rg: '12.345.678-9',

    pontos: 120,
    nivel: 3,
    progresso: 75,

    serie: '8º Ano',
    tipoEscola: 'Pública',
    disciplina: 'Matemática',

    condicao: 'TEA',
    nivelAutismo: 'Leve',
  };

  get iniciais(): string {
    if (!this.usuario?.nome) return '';

    return this.usuario.nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  sair() {
    console.log('Usuário saiu');
  }

  maskCpf(cpf: string | undefined): string {
    if (!cpf) return 'Não informado';

    return cpf.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      '$1.$2.$3-$4'
    );
  }

}
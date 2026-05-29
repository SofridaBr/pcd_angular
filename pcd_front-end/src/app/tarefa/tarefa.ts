import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tarefa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tarefa.html',
  styleUrl: './tarefa.scss',
})
export class Tarefa {

  tipoUsuario = 'professor';
  // coloque 'aluno' para testar aluno

  modalAberto = false;

  tarefas = [
    {
      titulo: 'Frações e porcentagem',
      materia: 'Matemática',
      descricao: 'Resolva as atividades no Google Forms.',
      link: 'https://forms.google.com',
      banner:
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
      concluida: false,
    },

    {
      titulo: 'Interpretação de texto',
      materia: 'Português',
      descricao: 'Leia o texto e responda o formulário.',
      link: 'https://forms.google.com',
      banner:
        'https://images.unsplash.com/photo-1513258496099-48168024aec0',
      concluida: true,
    },
  ];

  novaTarefa = {
    titulo: '',
    materia: '',
    descricao: '',
    link: '',
    banner: '',
    concluida: false,
  };

  abrirModal() {
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  criarTarefa() {

    this.tarefas.unshift({
      ...this.novaTarefa
    });

    this.novaTarefa = {
      titulo: '',
      materia: '',
      descricao: '',
      link: '',
      banner: '',
      concluida: false,
    };

    this.fecharModal();
  }

  marcarConcluida(tarefa: any) {
    tarefa.concluida = true;
  }
}
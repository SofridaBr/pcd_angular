import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SafeUrlPipe } from '../../pipes/safe-url-pipe';

const API = 'http://localhost:3000';

@Component({
  selector: 'app-tutoriais',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, SafeUrlPipe],
  templateUrl: './tutoriais.html',
  styleUrl: './tutoriais.scss'
})
export class Tutoriais implements OnInit {

  totalTarefas = 0;
  totalRecados = 0;
  usuario: any = null;
  iniciais = '';
  sidebarCollapsed = false;
  dataAtual = '';

  videos = [
    { titulo: 'Como usar a plataforma', descricao: 'Aprenda a navegar pelo EducaInclusiva.', url: 'https://www.youtube.com/embed/SEU_VIDEO_1' },
    { titulo: 'Como entregar tarefas', descricao: 'Veja o passo a passo para finalizar suas tarefas.', url: 'https://www.youtube.com/embed/SEU_VIDEO_2' },
    { titulo: 'Como ver seu boletim', descricao: 'Entenda como acessar suas notas.', url: 'https://www.youtube.com/embed/SEU_VIDEO_3' },
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (!raw) { window.location.href = '/login'; return; }
    this.usuario = JSON.parse(raw);

    const partes = (this.usuario.nome || '').split(' ');
    this.iniciais = (partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : partes[0]?.[0] || '?').toUpperCase();

    const agora = new Date();
    const dias = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    this.dataAtual = `${dias[agora.getDay()]}, ${agora.getDate()} de ${meses[agora.getMonth()]} de ${agora.getFullYear()}`;

    this.carregarTotalTarefas();
    this.carregarTotalRecados();
  }

  carregarTotalTarefas(): void {
    this.http.get<any>(`${API}/tarefas/aluno/${this.usuario.id}`).subscribe({
      next: (res) => {
        this.totalTarefas = (res.tarefas || []).filter((t: any) => t.concluida === 0 || t.concluida === false).length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  carregarTotalRecados(): void {
    this.http.get<any>(`${API}/recados/aluno/${this.usuario.id}`).subscribe({
      next: (res) => {
        this.totalRecados = (res.recados || []).filter((r: any) => r.lido === 0 || r.lido === false).length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  toggleSidebar(): void { this.sidebarCollapsed = !this.sidebarCollapsed; }

  sair(): void {
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('usuario');
    window.location.href = '/login';
  }
}
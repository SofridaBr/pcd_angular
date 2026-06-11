import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

const API = 'http://localhost:3000';

@Component({
  selector: 'app-materiais',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './materiais.html',
  styleUrl: './materiais.scss'
})
export class Materiais implements OnInit {
  totalTarefas = 0;
  totalRecados = 0;

  usuario: any = null;
  iniciais = '';
  sidebarCollapsed = false;
  dataAtual = '';

  materiais: any[] = [];
  carregando = true;
  filtroTipo = '';
  filtroMateria = '';

  get materiaisFiltrados(): any[] {
    return this.materiais.filter(m => {
      const okTipo = !this.filtroTipo || m.tipo === this.filtroTipo;
      const okMateria = !this.filtroMateria || m.materia === this.filtroMateria;
      return okTipo && okMateria;
    });
  }

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (!raw) { window.location.href = '/login'; return; }
    this.usuario = JSON.parse(raw);
    const partes = (this.usuario.nome || '').split(' ');
    this.iniciais = (partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : partes[0]?.[0] || '?').toUpperCase();

    const agora = new Date();
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    this.dataAtual = `${dias[agora.getDay()]}, ${agora.getDate()} de ${meses[agora.getMonth()]} de ${agora.getFullYear()}`;

    this.carregarMateriais();
  }

  carregarTotalTarefas(): void {
    this.http.get<any>(`${API}/tarefas/aluno/${this.usuario.id}`).subscribe({
      next: (res) => {
        this.totalTarefas = (res.tarefas || []).filter((t: any) => t.concluida === 0 || t.concluida === false).length;
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }

  carregarTotalRecados(): void {
    this.http.get<any>(`${API}/recados/aluno/${this.usuario.id}`).subscribe({
      next: (res) => {
        this.totalRecados = (res.recados || []).filter((r: any) => r.lido === 0 || r.lido === false).length;
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }


  carregarMateriais(): void {
    this.carregarTotalTarefas();
    this.carregarTotalRecados();
    this.carregando = true;
    this.cdr.detectChanges();
    this.http.get<any>(`${API}/materiais/aluno/${this.usuario.id}`).subscribe({
      next: (res) => {
        this.materiais = res.materiais;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.materiais = [];
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  getTipoIcon(tipo: string): string {
    const icons: Record<string, string> = {
      pdf: 'ti-file-type-pdf', video: 'ti-brand-youtube',
      link: 'ti-link', imagem: 'ti-photo', outro: 'ti-paperclip'
    };
    return icons[tipo] || 'ti-file';
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      pdf: 'PDF', video: 'Vídeo', link: 'Link', imagem: 'Imagem', outro: 'Outro'
    };
    return labels[tipo] || tipo;
  }

  getTipoCor(tipo: string): string {
    const cores: Record<string, string> = {
      pdf: 'red', video: 'purple', link: 'blue', imagem: 'green', outro: 'orange'
    };
    return cores[tipo] || 'blue';
  }

  isYoutube(url: string): boolean {
    return url?.includes('youtube.com') || url?.includes('youtu.be');
  }

  getYoutubeEmbed(url: string): string {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  }

  toggleSidebar(): void { this.sidebarCollapsed = !this.sidebarCollapsed; }

  sair(): void {
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('usuario');
    window.location.href = '/login';
  }
}
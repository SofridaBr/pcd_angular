import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

const API = 'http://localhost:3000';

@Component({
  selector: 'app-recados',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './recados.html',
  styleUrl: './recados.scss',
})
export class Recados implements OnInit {

  usuario: any = null;
  iniciais: string = '';
  sidebarCollapsed: boolean = false;
  recados: any[] = [];
  carregando: boolean = true;

  get totalNaoLidos(): number {
    return this.recados.filter(r => r.lido === 0 || r.lido === false).length;
  }

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (!raw) { window.location.href = '/login'; return; }
    this.usuario = JSON.parse(raw);
    const partes = (this.usuario.nome || '').split(' ');
    this.iniciais = (partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : partes[0]?.[0] || '?').toUpperCase();
    this.carregarRecados();
  }

  carregarRecados(): void {
    this.carregando = true;
    this.cdr.detectChanges();
    this.http.get<any>(`${API}/recados/aluno/${this.usuario.id}`).subscribe({
      next: (res) => {
        this.recados = (res.recados || []).map((r: any) => ({ ...r, aberto: false }));
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.recados = [];
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  marcarLido(recado: any): void {
    recado.aberto = !recado.aberto;
    if (!recado.lido) {
      recado.lido = 1;
      this.cdr.detectChanges();
      this.http.post<any>(`${API}/recados/ler/${recado.id}`, {}).subscribe({
        error: () => { recado.lido = 0; this.cdr.detectChanges(); }
      });
    }
  }

  formatarData(data: string): string {
    if (!data) return '';
    const d = new Date(data);
    const hoje = new Date();
    const diffH = Math.floor((hoje.getTime() - d.getTime()) / (1000 * 60 * 60));
    const diffD = Math.floor(diffH / 24);
    if (diffH < 1)   return 'Agora mesmo';
    if (diffH < 24)  return `${diffH}h atrás`;
    if (diffD === 1) return 'Ontem';
    if (diffD < 7)   return `${diffD} dias atrás`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  toggleSidebar(): void { this.sidebarCollapsed = !this.sidebarCollapsed; }

  sair(): void {
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('usuario');
    window.location.href = '/login';
  }
}
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../service/api';
@Component({
  selector: 'app-professor-configuracoes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './professor-configuracoes.html',
  styleUrl: './professor-configuracoes.scss'
})
export class ProfessorConfiguracoes implements OnInit {

  usuario: any = null;
  iniciais = '';
  abaAtiva: 'sobre' | 'privacidade' | 'termos' | 'suporte' = 'sobre';
  sidebarCollapsed = false;
  dataHoje: string = '';
  totalNaoLidos = 0;
  animating: boolean = true;

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private api: Api
  ) { }

  ngOnInit(): void {
    const usuario = this.api.getUsuario();
    if (!usuario) { this.router.navigate(['/login']); return; }

    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    this.usuario = raw ? JSON.parse(raw) : usuario;

    const partes = (this.usuario.nome || '').split(' ');
    this.iniciais = (partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : partes[0]?.[0] || '?').toUpperCase();

    this.dataHoje = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    this.carregarNaoLidos();
  }

  async carregarNaoLidos(): Promise<void> {
    const professorId = this.usuario?.id;
    if (!professorId) return;

    const res = await this.api.get(`/recados/recebidos/professor/${professorId}`);
    if (res.status) {
      const recados = res.dados.recados ?? [];
      this.totalNaoLidos = recados.filter((r: any) => r.lido === 0).length;
      this.cd.detectChanges();
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  sair(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  trocarAba(aba: typeof this.abaAtiva): void {
    this.animating = false;
    setTimeout(() => {
      this.abaAtiva = aba;
      this.animating = true;
      this.cd.detectChanges();
    }, 10);
  }
}
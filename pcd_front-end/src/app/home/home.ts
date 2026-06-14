import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Api } from '../service/api';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  usuario: any = null;
  iniciais = '';
  dataAtual = '';
  sidebarCollapsed = false;

  totalTarefas = 0;
  tarefasRecentes: any[] = [];

  totalRecadosNaoLidos = 0;
  recadosRecentes: any[] = [];

  constructor(private api: Api, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.carregarUsuario();
    this.carregarDataAtual();
    this.initGuiaLeitura();
  }

  
  carregarUsuario(): void {
    const usuario = this.api.getUsuario();
    if (!usuario) { window.location.href = '/login'; return; }

    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    this.usuario = raw ? JSON.parse(raw) : usuario;

    const partes = (this.usuario.nome || '').split(' ');
    this.iniciais = (partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : (partes[0]?.[0] || '?')).toUpperCase();

    this.carregarTarefas();
    this.carregarRecados();
  }

  carregarDataAtual(): void {
    const agora = new Date();
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    this.dataAtual = `${dias[agora.getDay()]}, ${agora.getDate()} de ${meses[agora.getMonth()]} de ${agora.getFullYear()}`;
  }

  async carregarTarefas(): Promise<void> {
    if (!this.usuario?.id) return;
    const res = await this.api.get(`/tarefas/aluno/${this.usuario.id}`);
    if (res.status) {
      const pendentes = (res.dados.tarefas || []).filter((t: any) =>
        t.concluida === 0 || t.concluida === false
      );
      this.totalTarefas = pendentes.length;
      this.tarefasRecentes = pendentes.slice(0, 3);
      this.cdr.detectChanges();
    }
  }

  async carregarRecados(): Promise<void> {
    if (!this.usuario?.id) return;
    const res = await this.api.get(`/recados/aluno/${this.usuario.id}`);
    if (res.status) {
      const todos = res.dados.recados || [];
      const naoLidos = todos.filter((r: any) => r.lido === 0 || r.lido === false);
      this.totalRecadosNaoLidos = naoLidos.length;
      this.recadosRecentes = naoLidos.slice(0, 2);
      this.cdr.detectChanges();
    }
  }

  toggleSidebar(): void { this.sidebarCollapsed = !this.sidebarCollapsed; }

  sair(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    window.location.href = '/login';
  }

  // ═══════════════════════════════════════
  // ACESSIBILIDADE
  // ═══════════════════════════════════════

  menuAcessibilidade = false;
  guiaLeitura = false;
  fontSize = 16;
  zoom = 1;
  altoContraste = false;
  dislexia = false;
  tdah = false;

  toggleMenu(): void { this.menuAcessibilidade = !this.menuAcessibilidade; }
  toggleGuide(): void { this.guiaLeitura = !this.guiaLeitura; }
  increaseFont(): void { this.fontSize += 2; document.body.style.fontSize = this.fontSize + 'px'; }
  decreaseFont(): void { this.fontSize -= 2; document.body.style.fontSize = this.fontSize + 'px'; }
  toggleContrast(): void { this.altoContraste = !this.altoContraste; document.body.classList.toggle('high-contrast'); }
  toggleDyslexia(): void { this.dislexia = !this.dislexia; document.body.classList.toggle('dyslexia'); }
  toggleTDAH(): void { this.tdah = !this.tdah; document.body.classList.toggle('tdah-mode'); }
  zoomPage(): void { this.zoom += 0.1; document.body.style.zoom = this.zoom.toString(); }
  speakText(): void { const s = new SpeechSynthesisUtterance(document.body.innerText); s.lang = 'pt-BR'; window.speechSynthesis.speak(s); }

  initGuiaLeitura(): void {
    document.addEventListener('mousemove', (e) => {
      const guia = document.getElementById('reading-guide');
      if (guia && this.guiaLeitura) {
        guia.style.display = 'block';
        guia.style.top = (e.clientY - 20) + 'px';
      }
    });
  }

}


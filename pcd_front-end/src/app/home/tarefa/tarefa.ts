import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';


const API = 'http://localhost:3000';

@Component({
  selector: 'app-tarefa',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './tarefa.html',
  styleUrl: './tarefa.scss',
})
export class Tarefa implements OnInit {

  // ── Propriedades existentes ──────────────────
  tipoUsuario: string = '';
  usuarioId: number = 0;
  modalAberto = false;
  tarefas: any[] = [];
  totalRecadosNaoLidos = 0;

  novaTarefa = {
    titulo: '', materia: '', descricao: '',
    link: '', banner: '', concluida: false,
  };

  // ── Propriedades novas ───────────────────────
  usuario: any = null;
  iniciais = '';
  dataAtual = '';
  sidebarCollapsed = false;
  filtroMateria = '';
  filtroStatus = '';
  materias = ['Português', 'Matemática', 'História', 'Geografia', 'Ciências', 'Inglês', 'Educação Física', 'Artes'];

  get totalPendentes(): number {
    return this.tarefas.filter(t => !t.concluida).length;
  }

  get tarefasFiltradas(): any[] {
    return this.tarefas.filter(t => {
      const okMateria = !this.filtroMateria || t.materia === this.filtroMateria;
      const okStatus = !this.filtroStatus ||
        (this.filtroStatus === 'pendente' && !t.concluida) ||
        (this.filtroStatus === 'concluida' && t.concluida);
      return okMateria && okStatus;
    });
  }

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    const usuarioStr = sessionStorage.getItem('usuario') || localStorage.getItem('usuario');
    if (!usuarioStr) { this.router.navigate(['/login']); return; }

    const usuario = JSON.parse(usuarioStr);
    this.tipoUsuario = usuario.tipo;
    this.usuarioId = usuario.id;

    // Dados pra sidebar
    this.usuario = usuario;
    const partes = (usuario.nome || '').split(' ');
    this.iniciais = (partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : partes[0]?.[0] || '?').toUpperCase();

    const agora = new Date();
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    this.dataAtual = `${dias[agora.getDay()]}, ${agora.getDate()} de ${meses[agora.getMonth()]} de ${agora.getFullYear()}`;

    this.carregarTarefas();
    this.carregarRecados();

  }



  carregarTarefas(): void {
    if (this.tipoUsuario === 'aluno') {
      this.http.get<any>(`${API}/tarefas/aluno/${this.usuarioId}`).subscribe({
        next: (res) => {
          this.tarefas = res.tarefas.map((t: any) => ({
            ...t,
            concluida: t.concluida === 1 || t.concluida === true
          }));
          this.cdr.detectChanges();
        },
        error: (err) => console.error('❌ Erro:', err)
      });
    } else {
      this.http.get<any>(`${API}/tarefas/professor/${this.usuarioId}`).subscribe({
        next: (res) => { this.tarefas = res.tarefas; this.cdr.detectChanges(); },
        error: () => console.error('Erro ao carregar tarefas do professor')
      });
    }
  }

  async carregarRecados(): Promise<void> {
    if (!this.usuarioId) return;
    try {
      const res = await fetch(`${API}/recados/aluno/${this.usuarioId}`);
      if (res.ok) {
        const dados = await res.json();
        const naoLidos = (dados.recados || []).filter((r: any) => r.lido === 0 || r.lido === false);
        this.totalRecadosNaoLidos = naoLidos.length;
        this.cdr.detectChanges();
      }
    } catch { }
  }

  abrirModal() { this.modalAberto = true; }
  fecharModal() { this.modalAberto = false; }

  criarTarefa() {
    if (!this.novaTarefa.titulo || !this.novaTarefa.link) return;
    this.router.navigate(['/professor']);
    this.fecharModal();
  }

  marcarConcluida(tarefa: any) {
    if (tarefa.concluida) return;
    this.http.post<any>(`${API}/tarefas/concluir`, {
      tarefaId: tarefa.id, alunoId: this.usuarioId
    }).subscribe({
      next: () => { tarefa.concluida = true; this.cdr.detectChanges(); },
      error: (err) => { console.error('Erro:', err); alert('Erro ao salvar.'); }
    });
  }

  isValidUrl(url: string): boolean {
    if (!url) return false;
    return url.startsWith('http') && !url.includes('forms.gle') &&
      (url.includes('.jpg') || url.includes('.png') ||
        url.includes('.jpeg') || url.includes('.webp') || url.includes('.gif'));
  }

  // ── Métodos novos ────────────────────────────
  aplicarFiltros() { }

  toggleSidebar() { this.sidebarCollapsed = !this.sidebarCollapsed; }

  sair() {
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
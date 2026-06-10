import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { Router, RouterModule, ActivatedRoute } from '@angular/router';


const API = 'http://localhost:3000';

const MATERIAS = [
  'Português', 'Matemática', 'História', 'Geografia',
  'Ciências', 'Inglês', 'Educação Física', 'Artes'
];

const MATERIA_EMOJIS: Record<string, string> = {
  'Português': '📖',
  'Matemática': '🔢',
  'História': '🏛️',
  'Geografia': '🌍',
  'Ciências': '🔬',
  'Inglês': '🌐',
  'Educação Física': '⚽',
  'Artes': '🎨',
};

@Component({
  selector: 'app-professor',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './professor.html',
  styleUrl: './professor.scss',
})
export class Professor implements OnInit {

  professorId: number = 0;
  nomeProfessor: string = '';
  dataHoje: string = '';
  iniciais: string = '';

  abaAtiva: 'alunos' | 'tarefas' | 'boletim' | 'recados' | 'materiais' = 'alunos';
  innerTab: 'visao' | 'alunos' = 'visao';
  filtroVisao: 'todos' | 'pcd' = 'todos';
  buscaAluno: string = '';

  alunos: any[] = [];
  emailNovoAluno: string = '';
  carregandoAdd: boolean = false;
  msgFeedbackAluno: string = '';
  erroAluno: boolean = false;
  serieFiltro: string = '';

  get seriesDisponiveis(): string[] {
    const set = new Set<string>();
    this.alunos.forEach(a => { if (a.serie && a.serie !== 'Sem informação') set.add(a.serie); });
    return Array.from(set).sort();
  }

  get alunosFiltrados(): any[] {
    if (!this.serieFiltro) return this.alunos;
    return this.alunos.filter(a => a.serie === this.serieFiltro);
  }

  get alunosPcd(): number {
    return this.alunos.filter(a => a.condicao && a.condicao !== 'Nenhuma').length;
  }

  get alunosFiltradosVisao(): any[] {
    let lista = this.alunos;
    if (this.filtroVisao === 'pcd') lista = lista.filter(a => a.condicao && a.condicao !== 'Nenhuma');
    if (this.buscaAluno.trim()) {
      const q = this.buscaAluno.toLowerCase();
      lista = lista.filter(a => a.nome?.toLowerCase().includes(q) || a.serie?.toLowerCase().includes(q));
    }
    return lista;
  }

  tarefasEnviadas: any[] = [];
  modalTarefaAberto: boolean = false;
  carregandoTarefa: boolean = false;
  msgFeedbackTarefa: string = '';
  erroTarefa: boolean = false;
  alunosSelecionados: number[] = [];
  serieFiltroModal: string = '';

  novaTarefa = { titulo: '', materia: '', descricao: '', link: '', banner: '' };

  get alunosParaTarefa(): any[] {
    if (!this.serieFiltroModal) return this.alunos;
    return this.alunos.filter(a => a.serie === this.serieFiltroModal);
  }

  get todosSelecionados(): boolean {
    return this.alunos.length > 0 && this.alunosSelecionados.length === this.alunos.length;
  }

  bimestreSelecionado: number = 1;
  alunoBoletimSelecionado: any = null;
  notasBoletim: Array<{ materia: string; nota: number | null; salvo: boolean }> = [];
  msgFeedbackBoletim: string = '';
  erroBoletim: boolean = false;

  recadosEnviados: any[] = [];
  modalRecadoAberto: boolean = false;
  carregandoRecado: boolean = false;
  msgFeedbackRecado: string = '';
  erroRecado: boolean = false;

  recadosRecebidos: any[] = [];
  abaRecados: 'enviados' | 'recebidos' = 'enviados';

  get totalNaoLidos(): number {
    return this.recadosRecebidos.filter(r => !r.lido).length;
  }

  novoRecado: { alunoId: number | null; titulo: string; mensagem: string } = {
    alunoId: null, titulo: '', mensagem: '',
  };

  materiaisEnviados: any[] = [];
  modalMaterialAberto: boolean = false;
  carregandoMaterial: boolean = false;
  msgFeedbackMaterial: string = '';
  erroMaterial: boolean = false;
  alunosMaterialSelecionados: number[] = [];
  serieFiltroMaterial: string = '';

  novoMaterial = { titulo: '', tipo: '', materia: '', descricao: '', url: '', banner: '' };

  get alunosParaMaterial(): any[] {
    if (!this.serieFiltroMaterial) return this.alunos;
    return this.alunos.filter(a => a.serie === this.serieFiltroMaterial);
  }

  get todosMaterialSelecionados(): boolean {
    return this.alunos.length > 0 && this.alunosMaterialSelecionados.length === this.alunos.length;
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const usuarioStr = sessionStorage.getItem('usuario') || localStorage.getItem('usuario');
    if (!usuarioStr) { this.router.navigate(['/login']); return; }
    const usuario = JSON.parse(usuarioStr);
    this.professorId = usuario.id;
    this.nomeProfessor = usuario.nome;
    this.dataHoje = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const partes = (this.nomeProfessor || '').split(' ');
    this.iniciais = (partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : partes[0]?.[0] || '?').toUpperCase();

    this.route.queryParams.subscribe(params => {
      if (params['aba']) {
        this.abaAtiva = params['aba'];
      }
    });

    this.carregarAlunos();
    this.carregarTarefasEnviadas();
    this.carregarRecadosEnviados();
    this.carregarMateriaisEnviados();
    this.carregarRecadosRecebidos();

  }

  sair(): void {
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  carregarAlunos(): void {
    this.http.get<any>(`${API}/alunos/${this.professorId}`).subscribe({
      next: (res) => { this.alunos = res.alunos; this.cdr.detectChanges(); },
      error: () => console.error('Erro ao carregar alunos')
    });
  }

  adicionarAluno(): void {
    if (!this.emailNovoAluno.trim()) {
      this.msgFeedbackAluno = 'Digite o email do aluno.';
      this.erroAluno = true;
      return;
    }
    this.carregandoAdd = true;
    this.msgFeedbackAluno = '';
    this.http.post<any>(`${API}/adicionar-aluno`, {
      professorId: this.professorId,
      emailAluno: this.emailNovoAluno.trim()
    }).subscribe({
      next: (res) => {
        this.msgFeedbackAluno = '✅ ' + res.mensagem;
        this.erroAluno = false;
        this.emailNovoAluno = '';
        this.carregandoAdd = false;
        this.carregarAlunos();
      },
      error: (err) => {
        this.msgFeedbackAluno = '❌ ' + (err.error?.mensagem || 'Erro ao adicionar aluno.');
        this.erroAluno = true;
        this.carregandoAdd = false;
      }
    });
  }

  abreviarSerie(serie: string): string {
    if (!serie) return '';
    const m = serie.match(/(\d+º)\s+Ano\s+do\s+Ensino\s+(Fundamental|Médio)/i);
    if (m) return m[1] + (m[2].toLowerCase() === 'fundamental' ? 'EF' : 'EM');
    return serie.substring(0, 4);
  }

  carregarTarefasEnviadas(): void {
    this.http.get<any>(`${API}/tarefas/professor/${this.professorId}`).subscribe({
      next: (res) => { this.tarefasEnviadas = res.tarefas; this.cdr.detectChanges(); },
      error: () => console.error('Erro ao carregar tarefas')
    });
  }

  abrirModalTarefa(): void {
    this.novaTarefa = { titulo: '', materia: '', descricao: '', link: '', banner: '' };
    this.alunosSelecionados = [];
    this.serieFiltroModal = '';
    this.msgFeedbackTarefa = '';
    this.modalTarefaAberto = true;
  }

  fecharModalTarefa(): void {
    this.modalTarefaAberto = false;
  }

  toggleAluno(alunoId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.alunosSelecionados.includes(alunoId)) this.alunosSelecionados.push(alunoId);
    } else {
      this.alunosSelecionados = this.alunosSelecionados.filter(id => id !== alunoId);
    }
  }

  selecionarTodos(): void {
    if (this.todosSelecionados) {
      this.alunosSelecionados = [];
    } else {
      this.alunosSelecionados = this.alunos.map(a => a.id);
    }
  }

  criarTarefa(): void {
    const { titulo, materia, link } = this.novaTarefa;
    if (!titulo.trim() || !materia.trim() || !link.trim()) {
      this.msgFeedbackTarefa = '❌ Preencha título, matéria e link.';
      this.erroTarefa = true;
      return;
    }
    if (this.alunosSelecionados.length === 0) {
      this.msgFeedbackTarefa = '❌ Selecione pelo menos um aluno.';
      this.erroTarefa = true;
      return;
    }
    this.carregandoTarefa = true;
    this.msgFeedbackTarefa = '';
    this.http.post<any>(`${API}/tarefas`, {
      professorId: this.professorId,
      ...this.novaTarefa,
      alunosIds: this.alunosSelecionados
    }).subscribe({
      next: () => {
        this.carregandoTarefa = false;
        this.msgFeedbackTarefa = '✅ Tarefa publicada com sucesso!';
        this.erroTarefa = false;
        this.carregarTarefasEnviadas();
        this.cdr.detectChanges();
        setTimeout(() => { this.fecharModalTarefa(); this.abaAtiva = 'tarefas'; }, 1500);
      },
      error: (err) => {
        this.msgFeedbackTarefa = '❌ ' + (err.error?.mensagem || 'Erro ao criar tarefa.');
        this.erroTarefa = true;
        this.carregandoTarefa = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirBoletimAluno(aluno: any): void {
    this.alunoBoletimSelecionado = aluno;
    this.abaAtiva = 'boletim';
    this.cdr.detectChanges();
    this.carregarNotasAluno();
  }

  onBimestreChange(): void {
    if (this.alunoBoletimSelecionado) this.carregarNotasAluno();
  }

  carregarNotasAluno(): void {
    const url = `${API}/boletim/professor/${this.professorId}/aluno/${this.alunoBoletimSelecionado.id}?bimestre=${this.bimestreSelecionado}`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.notasBoletim = res.boletim.map((item: any) => ({ ...item, salvo: false }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.notasBoletim = MATERIAS.map(m => ({ materia: m, nota: null, salvo: false }));
        this.cdr.detectChanges();
      }
    });
  }

  salvarNota(item: any): void {
    if (item.nota === null || item.nota === '') return;
    const nota = parseFloat(item.nota);
    if (isNaN(nota) || nota < 0 || nota > 10) {
      this.msgFeedbackBoletim = '❌ Nota inválida. Use valores de 0 a 10.';
      this.erroBoletim = true;
      return;
    }
    this.http.post<any>(`${API}/boletim`, {
      professorId: this.professorId,
      alunoId: this.alunoBoletimSelecionado.id,
      materia: item.materia,
      nota: nota,
      bimestre: this.bimestreSelecionado
    }).subscribe({
      next: () => {
        item.salvo = true;
        this.cdr.detectChanges();
        setTimeout(() => { item.salvo = false; this.cdr.detectChanges(); }, 2000);
        this.msgFeedbackBoletim = '';
      },
      error: (err) => {
        this.msgFeedbackBoletim = '❌ ' + (err.error?.mensagem || 'Erro ao salvar nota.');
        this.erroBoletim = true;
        this.cdr.detectChanges();
      }
    });
  }

  getMateriaEmoji(materia: string): string {
    return MATERIA_EMOJIS[materia] || '📚';
  }

  carregarRecadosEnviados(): void {
    this.http.get<any>(`${API}/recados/professor/${this.professorId}`).subscribe({
      next: (res) => { this.recadosEnviados = res.recados; this.cdr.detectChanges(); },
      error: () => console.error('Erro ao carregar recados')
    });
  }


  carregarRecadosRecebidos(): void {
    this.http.get<any>(`${API}/recados/recebidos/professor/${this.professorId}`).subscribe({
      next: (res) => { this.recadosRecebidos = res.recados; this.cdr.detectChanges(); },
      error: () => console.error('Erro ao carregar recados recebidos')
    });
  }

  marcarRecadoLido(id: number): void {
    this.http.patch<any>(`${API}/recados/${id}/lido`, { usuarioId: this.professorId }).subscribe({
      next: () => {
        this.recadosRecebidos = this.recadosRecebidos.map(r =>
          r.id === id ? { ...r, lido: true } : r
        );
        this.cdr.detectChanges();
      },
      error: () => { }
    });
  }

  abrirModalRecado(): void {
    this.novoRecado = { alunoId: null, titulo: '', mensagem: '' };
    this.msgFeedbackRecado = '';
    this.modalRecadoAberto = true;
  }

  fecharModalRecado(): void {
    this.modalRecadoAberto = false;
  }

  enviarRecado(): void {
    if (!this.novoRecado.titulo.trim() || !this.novoRecado.mensagem.trim()) {
      this.msgFeedbackRecado = '❌ Preencha título e mensagem.';
      this.erroRecado = true;
      return;
    }
    this.carregandoRecado = true;
    this.msgFeedbackRecado = '';
    this.http.post<any>(`${API}/recados`, {
      professorId: this.professorId,
      alunoId: this.novoRecado.alunoId || null,
      titulo: this.novoRecado.titulo,
      mensagem: this.novoRecado.mensagem
    }).subscribe({
      next: (res) => {
        this.carregandoRecado = false;
        this.msgFeedbackRecado = '✅ ' + res.mensagem;
        this.erroRecado = false;
        this.carregarRecadosEnviados();
        this.cdr.detectChanges();
        setTimeout(() => this.fecharModalRecado(), 1500);
      },
      error: (err) => {
        this.msgFeedbackRecado = '❌ ' + (err.error?.mensagem || 'Erro ao enviar recado.');
        this.erroRecado = true;
        this.carregandoRecado = false;
        this.cdr.detectChanges();
      }
    });
  }

  carregarMateriaisEnviados(): void {
    this.http.get<any>(`${API}/materiais/professor/${this.professorId}`).subscribe({
      next: (res) => { this.materiaisEnviados = res.materiais; this.cdr.detectChanges(); },
      error: () => console.error('Erro ao carregar materiais')
    });
  }

  abrirModalMaterial(): void {
    this.novoMaterial = { titulo: '', tipo: '', materia: '', descricao: '', url: '', banner: '' };
    this.alunosMaterialSelecionados = [];
    this.serieFiltroMaterial = '';
    this.msgFeedbackMaterial = '';
    this.modalMaterialAberto = true;
  }

  fecharModalMaterial(): void { this.modalMaterialAberto = false; }

  toggleAlunoMaterial(alunoId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.alunosMaterialSelecionados.includes(alunoId)) this.alunosMaterialSelecionados.push(alunoId);
    } else {
      this.alunosMaterialSelecionados = this.alunosMaterialSelecionados.filter(id => id !== alunoId);
    }
  }

  selecionarTodosMaterial(): void {
    if (this.todosMaterialSelecionados) {
      this.alunosMaterialSelecionados = [];
    } else {
      this.alunosMaterialSelecionados = this.alunos.map(a => a.id);
    }
  }

  publicarMaterial(): void {
    const { titulo, tipo, url } = this.novoMaterial;
    if (!titulo.trim() || !tipo || !url.trim()) {
      this.msgFeedbackMaterial = '❌ Preencha título, tipo e URL.';
      this.erroMaterial = true;
      return;
    }
    if (this.alunosMaterialSelecionados.length === 0) {
      this.msgFeedbackMaterial = '❌ Selecione pelo menos um aluno.';
      this.erroMaterial = true;
      return;
    }
    this.carregandoMaterial = true;
    this.msgFeedbackMaterial = '';
    this.http.post<any>(`${API}/materiais`, {
      professorId: this.professorId,
      ...this.novoMaterial,
      alunosIds: this.alunosMaterialSelecionados
    }).subscribe({
      next: () => {
        this.carregandoMaterial = false;
        this.msgFeedbackMaterial = '✅ Material publicado com sucesso!';
        this.erroMaterial = false;
        this.carregarMateriaisEnviados();
        this.cdr.detectChanges();
        setTimeout(() => { this.fecharModalMaterial(); this.abaAtiva = 'materiais'; }, 1500);
      },
      error: (err) => {
        this.msgFeedbackMaterial = '❌ ' + (err.error?.mensagem || 'Erro ao publicar.');
        this.erroMaterial = true;
        this.carregandoMaterial = false;
        this.cdr.detectChanges();
      }
    });
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      pdf: '📄 PDF', video: '🎬 Vídeo', link: '🔗 Link',
      imagem: '🖼️ Imagem', outro: '📎 Outro'
    };
    return labels[tipo] || tipo;
  }

  isValidUrl(url: string): boolean {
    return url?.startsWith('http') ?? false;
  }

  formatarData(data: string): string {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  irParaRecados(): void {
    this.abaAtiva = 'recados';
    this.abaRecados = 'enviados';

  }

  get isRecadosAtivo(): boolean {
    return this.abaAtiva === 'recados';

  }
}


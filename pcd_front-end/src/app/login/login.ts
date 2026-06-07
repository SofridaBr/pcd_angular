import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../service/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})

export class Login {

  constructor(private api: Api) { }

  // ═══════════════════════════════════════
  // TABS
  // ═══════════════════════════════════════

  abaAtual: string = 'aluno';

  switchTab(tab: string): void {
    this.abaAtual = tab;
    this.alertaAcesso = '';
  }

  // ═══════════════════════════════════════
  // MODAIS
  // ═══════════════════════════════════════

  modalAlunoAberto = false;
  modalInstitucionalAberto = false;

  abrirModalAluno(): void {
    this.modalAlunoAberto = true;
  }

  fecharModalAluno(): void {
    this.modalAlunoAberto = false;
  }

  abrirModalInstitucional(): void {
    this.modalInstitucionalAberto = true;
  }

  fecharModalInstitucional(): void {
    this.modalInstitucionalAberto = false;
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

  toggleMenu(): void {
    this.menuAcessibilidade = !this.menuAcessibilidade;
  }

  toggleGuide(): void {
    this.guiaLeitura = !this.guiaLeitura;
  }

  increaseFont(): void {
    this.fontSize += 2;
    document.body.style.fontSize = this.fontSize + 'px';
  }

  decreaseFont(): void {
    this.fontSize -= 2;
    document.body.style.fontSize = this.fontSize + 'px';
  }

  toggleContrast(): void {
    this.altoContraste = !this.altoContraste;
    document.body.classList.toggle('high-contrast');
  }

  toggleDyslexia(): void {
    this.dislexia = !this.dislexia;
    document.body.classList.toggle('dyslexia');
  }

  toggleTDAH(): void {
    this.tdah = !this.tdah;
    document.body.classList.toggle('tdah-mode');
  }

  zoomPage(): void {
    this.zoom += 0.1;
    document.body.style.zoom = this.zoom.toString();
  }

  speakText(): void {
    const speech = new SpeechSynthesisUtterance(document.body.innerText);
    speech.lang = 'pt-BR';
    window.speechSynthesis.speak(speech);
  }

  // ═══════════════════════════════════════
  // ALERTAS
  // ═══════════════════════════════════════

  alertaAcesso = '';

  mostrarAcessoNegado(msg: string): void {
    this.alertaAcesso = msg;

    setTimeout(() => {
      this.alertaAcesso = '';
    }, 7000);
  }

  // ═══════════════════════════════════════
  // LOGIN ALUNO
  // ═══════════════════════════════════════

  aluno = {
    email: '',
    senha: ''
  };

  async loginAluno(): Promise<void> {

    if (!this.aluno.email || !this.aluno.senha) {
      alert('Preencha e-mail e senha.');
      return;
    }

    try {

      const resposta = await this.api.login(this.aluno);

      if (!resposta.status) {
        alert(resposta.dados.mensagem);
        return;
      }

      const usuario = resposta.dados.usuario;

      if (usuario.tipo !== 'aluno') {
        this.mostrarAcessoNegado('Esta área é exclusiva para alunos.');
        return;
      }

      localStorage.setItem('usuario', JSON.stringify(usuario));

      window.location.href = '/painel/tarefas';

    } catch (error) {
      alert('Erro ao conectar ao servidor.');
    }
  }

  // ═══════════════════════════════════════
  // LOGIN PROFESSOR
  // ═══════════════════════════════════════

  professor = {
    tipo: 'Professor(a)',
    email: '',
    senha: ''
  };

  tipoMap: any = {
    'Professor(a)': 'professor',
    'Responsável / Familiar': 'responsavel',
    'Coordenador(a)': 'coordenador',
    'Apoio / Cuidador': 'apoio'
  };

  async loginProfessor(): Promise<void> {

    if (!this.professor.email || !this.professor.senha) {
      alert('Preencha e-mail e senha.');
      return;
    }

    try {

      const resposta = await this.api.login({
        email: this.professor.email,
        senha: this.professor.senha
      });

      if (!resposta.status) {
        alert(resposta.dados.mensagem);
        return;
      }

      const usuario = resposta.dados.usuario;

      const tipoEsperado = this.tipoMap[this.professor.tipo];

      if (usuario.tipo !== tipoEsperado) {
        this.mostrarAcessoNegado('Tipo de conta incorreto.');
        return;
      }

      localStorage.setItem('usuario', JSON.stringify(usuario));

      
if (usuario.tipo === 'coordenador') {
  window.location.href = '/coordenador';
} else if (usuario.tipo === 'responsavel') {
  window.location.href = '/responsavel';
} else if (usuario.tipo === 'apoio') {
  window.location.href = '/apoio';
} else {
  window.location.href = '/professor';
}
      
    } catch (error) {
      alert('Erro ao conectar ao servidor.');
    }
  }

  // ═══════════════════════════════════════
  // CADASTRO ALUNO
  // ═══════════════════════════════════════

  cadastroAluno = {
    nome: '',
    email: '',
    cpf: '',
    rg: '',
    telefone: '',
    serie: '',
    tipoEscola: 'Não informado' as 'Regular' | 'Integral' | 'Não informado',
    nivelAutismo: 0,
    condicao: 'Nenhuma',
    tipo: 'aluno',
    senha: '',
    senha2: ''
  };

  alertaAluno = '';

  async cadastrarAluno(): Promise<void> {

    if (
      !this.cadastroAluno.nome ||
      !this.cadastroAluno.email ||
      !this.cadastroAluno.cpf ||
      !this.cadastroAluno.rg ||
      !this.cadastroAluno.telefone ||
      !this.cadastroAluno.senha
    ) {
      this.alertaAluno = 'Preencha todos os campos obrigatórios (*)';
      return;
    }

    if (this.cadastroAluno.senha !== this.cadastroAluno.senha2) {
      this.alertaAluno = 'As senhas não coincidem';
      return;
    }

    if (this.cadastroAluno.senha.length < 6) {
      this.alertaAluno = 'A senha deve ter pelo menos 6 caracteres';
      return;
    }

    const { senha2, tipo, ...payload } = this.cadastroAluno;

    try {
      const res = await fetch('http://localhost:3000/cadastro/aluno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const dados = await res.json();

      if (!res.ok) {
        this.alertaAluno = dados.mensagem || `Erro ${res.status}`;
        return;
      }

      this.alertaAluno = 'Conta criada com sucesso!';
      setTimeout(() => this.fecharModalAluno(), 2000);

    } catch (err) {
      this.alertaAluno = 'Erro ao conectar ao servidor';
    }
  }

  // ═══════════════════════════════════════
  // CADASTRO INSTITUCIONAL
  // ═══════════════════════════════════════

  cadastroInstitucional = {
    nome: '',
    tipo: 'professor',
    email: '',
    cpf: '',
    rg: '',
    telefone: '',
    disciplina: '',
    tipoEscola: 'Não informado' as 'Regular' | 'Integral' | 'Não informado',
    senha: '',
    senha2: ''
  };

  alertaInstitucional = '';

  async cadastrarInstitucional(): Promise<void> {

    if (
      !this.cadastroInstitucional.nome ||
      !this.cadastroInstitucional.email ||
      !this.cadastroInstitucional.cpf ||
      !this.cadastroInstitucional.rg ||
      !this.cadastroInstitucional.telefone ||
      !this.cadastroInstitucional.senha
    ) {
      this.alertaInstitucional = 'Preencha todos os campos obrigatórios (*)';
      return;
    }

    if (
      this.cadastroInstitucional.tipo === 'professor' &&
      !this.cadastroInstitucional.disciplina
    ) {
      this.alertaInstitucional = 'Informe a disciplina do professor';
      return;
    }

    if (
      this.cadastroInstitucional.senha !==
      this.cadastroInstitucional.senha2
    ) {
      this.alertaInstitucional = 'As senhas não coincidem';
      return;
    }

    if (this.cadastroInstitucional.senha.length < 6) {
      this.alertaInstitucional =
        'A senha deve ter pelo menos 6 caracteres';
      return;
    }

    const { senha2, ...payload } = this.cadastroInstitucional;

    try {

      const res = await fetch(
        'http://localhost:3000/cadastro/institucional',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      const dados = await res.json();

      if (!res.ok) {
        this.alertaInstitucional =
          dados.mensagem || `Erro ${res.status}`;
        return;
      }

      this.alertaInstitucional =
        'Cadastro solicitado com sucesso!';

      setTimeout(() => {
        this.fecharModalInstitucional();
      }, 2000);

    } catch (err) {

      this.alertaInstitucional =
        'Erro ao conectar ao servidor';

    }
  }

  mascaraCpf(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').substring(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = v;
    this.cadastroAluno.cpf = v;
  }

  mascaraRg(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').substring(0, 9);
    v = v.replace(/(\d{2})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1})$/, '$1-$2');
    input.value = v;
    this.cadastroAluno.rg = v;
  }

  mascaraTelefone(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').substring(0, 11);
    v = v.replace(/(\d{2})(\d)/, '($1) $2');
    v = v.replace(/(\d{5})(\d)/, '$1-$2');
    input.value = v;
    this.cadastroAluno.telefone = v;
  }

  mascaraCpfInst(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').substring(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = v;
    this.cadastroInstitucional.cpf = v;
  }

  mascaraRgInst(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').substring(0, 9);
    v = v.replace(/(\d{2})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1})$/, '$1-$2');
    input.value = v;
    this.cadastroInstitucional.rg = v;
  }

  mascaraTelefoneInst(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').substring(0, 11);
    v = v.replace(/(\d{2})(\d)/, '($1) $2');
    v = v.replace(/(\d{5})(\d)/, '$1-$2');
    input.value = v;
    this.cadastroInstitucional.telefone = v;
  }
}


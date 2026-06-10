import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Importado o ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

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

  // 2. Injetado o cd no construtor
  constructor(
    private router: Router,
    private cd: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    const raw = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (!raw) { this.router.navigate(['/login']); return; }
    this.usuario = JSON.parse(raw);

    const partes = (this.usuario.nome || '').split(' ');
    this.iniciais = (partes.length >= 2
      ? partes[0][0] + partes[partes.length - 1][0]
      : partes[0]?.[0] || '?').toUpperCase();

    this.dataHoje = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    this.carregarNaoLidos(); 
  }

  carregarNaoLidos(): void {
    const professorId = this.usuario?.id;
    if (!professorId) return;
  
    setTimeout(() => {
      fetch(`http://localhost:3000/recados/recebidos/professor/${professorId}`)
        .then(r => r.json())
        .then(data => {
          const recados = data.recados ?? [];
          this.totalNaoLidos = recados.filter((r: any) => r.lido === 0).length;
          
          // 3. ADICIONADO AQUI: Avisa o Angular para atualizar o HTML na mesma hora!
          this.cd.detectChanges(); 
        })
        .catch(() => {
          this.totalNaoLidos = 0;
          this.cd.detectChanges(); // Garante a atualização mesmo se der erro
        });
    }, 300);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  sair(): void {
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
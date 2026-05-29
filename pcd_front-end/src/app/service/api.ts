import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Api {

  private url = 'http://localhost:3000';

  // ═══════════════════════════════════════
  // LOGIN
  // ═══════════════════════════════════════

  async login(dados: any) {

    const res = await fetch(`${this.url}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    });

    return {
      status: res.ok,
      dados: await res.json()
    };
  }

  // ═══════════════════════════════════════
  // CADASTRO ALUNO
  // ═══════════════════════════════════════

  async cadastrarAluno(dados: any) {

    const res = await fetch(`${this.url}/cadastro/aluno`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    });

    return {
      status: res.ok,
      dados: await res.json()
    };
  }
}
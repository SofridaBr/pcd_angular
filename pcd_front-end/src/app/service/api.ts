import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Api {

  private url = 'https://educainclusiva-backend-hvvz.onrender.com';

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  getTipoUsuario(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1])).tipo;
    } catch { return null; }
  }

  getUsuario(): any {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch { return null; }
  }

  async login(dados: any) {
    const res = await fetch(`${this.url}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    const json = await res.json();
    if (res.ok) {
      localStorage.setItem('token', json.token);
      localStorage.setItem('usuario', JSON.stringify(json.usuario));
    }
    return { status: res.ok, dados: json };
  }

  async get(path: string) {
    const res = await fetch(`${this.url}${path}`, {
      headers: this.getHeaders()
    });
    return { status: res.ok, dados: await res.json() };
  }

  async post(path: string, dados: any) {
    const res = await fetch(`${this.url}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(dados)
    });
    return { status: res.ok, dados: await res.json() };
  }

  async delete(path: string) {
    const res = await fetch(`${this.url}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return { status: res.ok, dados: await res.json() };
  }

  async patch(path: string, dados: any) {
    const res = await fetch(`${this.url}${path}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(dados)
    });
    return { status: res.ok, dados: await res.json() };
  }

} // ← fecha a classe aqui
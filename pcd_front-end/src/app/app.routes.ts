import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { Informacoes } from './informacoes/informacoes';


export const routes: Routes = [
    {path: "", component: Login} , 
    {path: "home", component: Home} ,
    {path: "info", component: Informacoes} ,
    

];


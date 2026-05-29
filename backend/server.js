const express = require("express");
const mysql   = require("mysql2");
const cors    = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ════════════════════════════════════════════════
// CONEXÃO COM MYSQL
// ════════════════════════════════════════════════
const conexao = mysql.createPool({
    host:             "localhost",
    user:             "root",
    password:         "123456",
    database:         "educa_inclusiva",
    waitForConnections: true,
    connectionLimit:  10
});

// ════════════════════════════════════════════════
// LOGIN (todos os tipos)
// ════════════════════════════════════════════════
app.post("/login", (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ mensagem: "Preencha email e senha." });
    }

    const sql = `
        SELECT id, nome, email, tipo, nivel, pontos, progresso, condicao, 
               cpf, rg, telefone, serie, tipoEscola, disciplina, nivelAutismo
        FROM usuarios
        WHERE email = ? AND senha = ?
    `;

    conexao.query(sql, [email, senha], (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });

        if (resultado.length > 0) {
            res.json({ mensagem: "Login correto", usuario: resultado[0] });
        } else {
            res.status(401).json({ mensagem: "Email ou senha incorretos." });
        }
    });
});

// ════════════════════════════════════════════════
// CADASTRO DE ALUNO (auto-registro)
// ✅ Agora recebe e salva o campo "condicao" vindo do front
// ════════════════════════════════════════════════
app.post("/cadastro/aluno", (req, res) => {
    // ✅ Desestrutura condicao junto com os demais campos
    const { nome, email, cpf, rg, telefone, serie, tipoEscola, nivelAutismo, condicao, senha } = req.body;

    if (!nome || !email || !cpf || !rg || !telefone || !senha) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios." });
    }
    if (senha.length < 6) {
        return res.status(400).json({ mensagem: "A senha deve ter pelo menos 6 caracteres." });
    }

    // Verifica email duplicado
    conexao.query(`SELECT id FROM usuarios WHERE email = ?`, [email], (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
        if (resultado.length > 0) return res.status(400).json({ mensagem: "Este email já está cadastrado." });

        // Verifica CPF duplicado
        conexao.query(`SELECT id FROM usuarios WHERE cpf = ?`, [cpf], (erro, resultado) => {
            if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
            if (resultado.length > 0) return res.status(400).json({ mensagem: "Este CPF já está cadastrado." });

            // Verifica RG duplicado
            conexao.query(`SELECT id FROM usuarios WHERE rg = ?`, [rg], (erro, resultado) => {
                if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
                if (resultado.length > 0) return res.status(400).json({ mensagem: "Este RG já está cadastrado." });

                const sqlInsere = `
                    INSERT INTO usuarios 
                    (nome, email, cpf, rg, telefone, serie, tipoEscola, nivelAutismo, 
                     senha, tipo, nivel, pontos, progresso, condicao)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'aluno', 1, 0, 0, ?)
                `;

                conexao.query(
                    sqlInsere,
                    [
                        nome,
                        email,
                        cpf,
                        rg,
                        telefone,
                        serie        || 'Sem informação',
                        tipoEscola   || 'Não informado',
                        nivelAutismo || 0,
                        senha,
                        condicao     || 'Nenhuma'   // ✅ salva a condição escolhida pelo aluno no cadastro
                    ],
                    (erro, resultado) => {
                        if (erro) return res.status(500).json({ mensagem: "Erro ao criar conta." });
                        res.json({
                            mensagem: "Conta criada com sucesso!",
                            usuario: {
                                id: resultado.insertId,
                                nome, email, cpf, rg, telefone,
                                serie, tipoEscola, nivelAutismo,
                                condicao: condicao || 'Nenhuma',
                                tipo: "aluno"
                            }
                        });
                    }
                );
            });
        });
    });
});

// ════════════════════════════════════════════════
// CADASTRO INSTITUCIONAL
// professor / responsavel / coordenador / apoio
// ════════════════════════════════════════════════
app.post("/cadastro/institucional", (req, res) => {
    const { nome, email, cpf, rg, telefone, disciplina, tipoEscola, tipo, senha } = req.body;

    const tiposPermitidos = ["professor", "responsavel", "coordenador", "apoio"];

    if (!nome || !email || !cpf || !rg || !telefone || !tipo || !senha) {
        return res.status(400).json({ mensagem: "Todos os campos obrigatórios não foram preenchidos." });
    }
    if (!tiposPermitidos.includes(tipo)) {
        return res.status(400).json({ mensagem: "Tipo de acesso inválido." });
    }
    if (senha.length < 6) {
        return res.status(400).json({ mensagem: "A senha deve ter pelo menos 6 caracteres." });
    }
    if ((tipo === "professor" || tipo === "apoio") && !disciplina) {
        return res.status(400).json({ mensagem: "Disciplina é obrigatória para professores." });
    }

    conexao.query(`SELECT id FROM usuarios WHERE email = ?`, [email], (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
        if (resultado.length > 0) return res.status(400).json({ mensagem: "Este email já está cadastrado." });

        conexao.query(`SELECT id FROM usuarios WHERE cpf = ?`, [cpf], (erro, resultado) => {
            if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
            if (resultado.length > 0) return res.status(400).json({ mensagem: "Este CPF já está cadastrado." });

            conexao.query(`SELECT id FROM usuarios WHERE rg = ?`, [rg], (erro, resultado) => {
                if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
                if (resultado.length > 0) return res.status(400).json({ mensagem: "Este RG já está cadastrado." });

                const sqlInsere = `
                    INSERT INTO usuarios 
                    (nome, email, cpf, rg, telefone, disciplina, tipoEscola, tipo, senha)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                conexao.query(
                    sqlInsere,
                    [nome, email, cpf, rg, telefone, disciplina || null, tipoEscola || 'Não informado', tipo, senha],
                    (erro, resultado) => {
                        if (erro) return res.status(500).json({ mensagem: "Erro ao criar conta." });
                        res.json({
                            mensagem: "Cadastro realizado com sucesso!",
                            usuario: {
                                id: resultado.insertId, nome, email, cpf, rg, telefone, disciplina, tipoEscola, tipo
                            }
                        });
                    }
                );
            });
        });
    });
});

// ════════════════════════════════════════════════
// ATUALIZAR CONDIÇÃO DO ALUNO
// ════════════════════════════════════════════════
app.post("/atualizar-condicao", (req, res) => {
    const { id, condicao } = req.body;

    if (!id || !condicao) {
        return res.status(400).json({ mensagem: "ID e condição são obrigatórios." });
    }

    const sql = `UPDATE usuarios SET condicao = ? WHERE id = ? AND tipo = 'aluno'`;

    conexao.query(sql, [condicao, id], (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
        if (resultado.affectedRows === 0) return res.status(404).json({ mensagem: "Aluno não encontrado." });
        res.json({ mensagem: "Condição atualizada com sucesso." });
    });
});

// ════════════════════════════════════════════════
// BUSCAR DADOS DE UM ALUNO ESPECÍFICO
// ════════════════════════════════════════════════
app.get("/aluno/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT id, nome, email, cpf, rg, telefone, serie, tipo, nivel, pontos, 
               progresso, condicao, tipoEscola, nivelAutismo
        FROM usuarios
        WHERE id = ? AND tipo = 'aluno'
    `;

    conexao.query(sql, [id], (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
        if (resultado.length === 0) return res.status(404).json({ mensagem: "Aluno não encontrado." });
        res.json({ aluno: resultado[0] });
    });
});

// ════════════════════════════════════════════════
// BUSCAR ALUNOS DO PROFESSOR / RESPONSÁVEL
// ════════════════════════════════════════════════
app.get("/alunos/:professorId", (req, res) => {
    const { professorId } = req.params;

    const sql = `
        SELECT u.id, u.nome, u.email, u.cpf, u.rg, u.telefone, u.serie, u.tipo, 
               u.nivel, u.pontos, u.progresso, u.condicao, u.tipoEscola, u.nivelAutismo
        FROM usuarios u
        INNER JOIN professor_aluno pa ON u.id = pa.aluno_id
        WHERE pa.professor_id = ? AND u.tipo = 'aluno'
    `;

    conexao.query(sql, [professorId], (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
        res.json({ alunos: resultado });
    });
});

// ════════════════════════════════════════════════
// ADICIONAR ALUNO AO PROFESSOR / RESPONSÁVEL
// ════════════════════════════════════════════════
app.post("/adicionar-aluno", (req, res) => {
    const { professorId, emailAluno } = req.body;

    if (!professorId || !emailAluno) {
        return res.status(400).json({ mensagem: "Dados incompletos." });
    }

    conexao.query(
        `SELECT id FROM usuarios WHERE email = ? AND tipo = 'aluno'`,
        [emailAluno],
        (erro, resultado) => {
            if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
            if (resultado.length === 0)
                return res.status(404).json({ mensagem: "Aluno não encontrado com esse email." });

            const alunoId = resultado[0].id;

            conexao.query(
                `SELECT id FROM professor_aluno WHERE professor_id = ? AND aluno_id = ?`,
                [professorId, alunoId],
                (erro, resultado) => {
                    if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
                    if (resultado.length > 0)
                        return res.status(400).json({ mensagem: "Este aluno já está vinculado." });

                    conexao.query(
                        `INSERT INTO professor_aluno (professor_id, aluno_id) VALUES (?, ?)`,
                        [professorId, alunoId],
                        (erro) => {
                            if (erro) return res.status(500).json({ mensagem: "Erro ao adicionar aluno." });
                            res.json({ mensagem: "Aluno adicionado com sucesso!", alunoId });
                        }
                    );
                }
            );
        }
    );
});

// ════════════════════════════════════════════════
// ESTATÍSTICAS GERAIS DA ESCOLA (coordenador)
// ════════════════════════════════════════════════
app.get("/escola/stats", (req, res) => {
    const sqlAlunos = `
        SELECT
            COUNT(*) AS totalAlunos,
            AVG(progresso) AS progressoMedio,
            SUM(CASE WHEN condicao = 'Visual'    THEN 1 ELSE 0 END) AS visual,
            SUM(CASE WHEN condicao = 'Auditiva'  THEN 1 ELSE 0 END) AS auditiva,
            SUM(CASE WHEN condicao = 'Cognitiva' THEN 1 ELSE 0 END) AS cognitiva,
            SUM(CASE WHEN condicao = 'Física'    THEN 1 ELSE 0 END) AS fisica,
            SUM(CASE WHEN condicao IS NULL OR condicao = 'Nenhuma' THEN 1 ELSE 0 END) AS nenhuma
        FROM usuarios
        WHERE tipo = 'aluno'
    `;

    const sqlProfessores = `
        SELECT COUNT(*) AS totalProfessores
        FROM usuarios
        WHERE tipo IN ('professor', 'coordenador', 'apoio')
    `;

    conexao.query(sqlAlunos, (erro, resAlunos) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });

        conexao.query(sqlProfessores, (erro, resProfs) => {
            if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });

            res.json({
                totalAlunos:      resAlunos[0].totalAlunos,
                totalProfessores: resProfs[0].totalProfessores,
                progressoMedio:   Math.round(resAlunos[0].progressoMedio || 0),
                condicoes: {
                    Visual:    resAlunos[0].visual,
                    Auditiva:  resAlunos[0].auditiva,
                    Cognitiva: resAlunos[0].cognitiva,
                    Fisica:    resAlunos[0].fisica,
                    Nenhuma:   resAlunos[0].nenhuma
                }
            });
        });
    });
});

// ════════════════════════════════════════════════
// TURMAS POR EDUCADOR (coordenador)
// ════════════════════════════════════════════════
app.get("/escola/turmas", (req, res) => {
    const sql = `
        SELECT
            u.nome AS professor,
            u.disciplina,
            COUNT(pa.aluno_id) AS totalAlunos,
            AVG(al.progresso)  AS progressoMedio
        FROM usuarios u
        LEFT JOIN professor_aluno pa ON u.id = pa.professor_id
        LEFT JOIN usuarios al        ON pa.aluno_id = al.id
        WHERE u.tipo IN ('professor', 'coordenador', 'apoio')
        GROUP BY u.id, u.nome, u.disciplina
        ORDER BY totalAlunos DESC
    `;

    conexao.query(sql, (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
        res.json({ turmas: resultado });
    });
});

// ════════════════════════════════════════════════
// SERVIDOR
// ════════════════════════════════════════════════
app.listen(3000, () => {
    console.log("✅ Servidor EducaInclusiva rodando na porta 3000");
});
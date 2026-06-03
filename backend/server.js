const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ════════════════════════════════════════════════
// CONEXÃO COM MYSQL
// ════════════════════════════════════════════════
const conexao = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "educa_inclusiva",
    waitForConnections: true,
    connectionLimit: 10
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
// ════════════════════════════════════════════════
app.post("/cadastro/aluno", (req, res) => {
    const { nome, email, cpf, rg, telefone, serie, tipoEscola, nivelAutismo, condicao, senha } = req.body;

    if (!nome || !email || !cpf || !rg || !telefone || !senha) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios." });
    }
    if (senha.length < 6) {
        return res.status(400).json({ mensagem: "A senha deve ter pelo menos 6 caracteres." });
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
                    (nome, email, cpf, rg, telefone, serie, tipoEscola, nivelAutismo, 
                     senha, tipo, nivel, pontos, progresso, condicao)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'aluno', 1, 0, 0, ?)
                `;

                conexao.query(
                    sqlInsere,
                    [
                        nome, email, cpf, rg, telefone,
                        serie || 'Sem informação',
                        tipoEscola || 'Não informado',
                        nivelAutismo || 0,
                        senha,
                        condicao || 'Nenhuma'
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
// BUSCAR TODOS OS ALUNOS (coordenador)
// ════════════════════════════════════════════════
app.get("/alunos/todos", (req, res) => {
    const sql = `
        SELECT id, nome, email, serie, tipo, nivel, pontos,
               progresso, condicao, tipoEscola, nivelAutismo
        FROM usuarios
        WHERE tipo = 'aluno'
        ORDER BY nome ASC
    `;
    conexao.query(sql, (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
        res.json({ alunos: resultado });
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
        ORDER BY u.serie, u.nome
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
// CRIAR TAREFA
// ════════════════════════════════════════════════
app.post("/tarefas", (req, res) => {
    const { professorId, titulo, materia, descricao, link, banner, alunosIds } = req.body;

    if (!professorId || !titulo || !materia || !link) {
        return res.status(400).json({ mensagem: "Campos obrigatórios: professorId, titulo, materia, link." });
    }

    if (!alunosIds || alunosIds.length === 0) {
        return res.status(400).json({ mensagem: "Selecione pelo menos um aluno." });
    }

    const sqlTarefa = `
        INSERT INTO tarefas (professor_id, titulo, materia, descricao, link, banner)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    conexao.query(
        sqlTarefa,
        [professorId, titulo, materia, descricao || '', link, banner || null],
        (erro, resultado) => {
            if (erro) return res.status(500).json({ mensagem: "Erro ao criar tarefa." });

            const tarefaId = resultado.insertId;
            const valores = alunosIds.map((alunoId) => [tarefaId, alunoId]);
            const sqlVinculo = `INSERT INTO tarefa_aluno (tarefa_id, aluno_id) VALUES ?`;

            conexao.query(sqlVinculo, [valores], (erro) => {
                if (erro) return res.status(500).json({ mensagem: "Tarefa criada, mas erro ao vincular alunos." });
                res.json({ mensagem: "Tarefa criada e enviada com sucesso!", tarefaId });
            });
        }
    );
});

// ════════════════════════════════════════════════
// BUSCAR TAREFAS DO ALUNO
// ════════════════════════════════════════════════
app.get("/tarefas/aluno/:alunoId", (req, res) => {
    const { alunoId } = req.params;

    const sql = `
        SELECT 
            t.id, t.titulo, t.materia, t.descricao, t.link, t.banner, t.data_criacao,
            ta.concluida, ta.data_conclusao
        FROM tarefas t
        INNER JOIN tarefa_aluno ta ON t.id = ta.tarefa_id
        WHERE ta.aluno_id = ?
        ORDER BY t.data_criacao DESC
    `;

    conexao.query(sql, [alunoId], (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
        res.json({ tarefas: resultado });
    });
});

// ════════════════════════════════════════════════
// BUSCAR TAREFAS DO PROFESSOR
// ════════════════════════════════════════════════
app.get("/tarefas/professor/:professorId", (req, res) => {
    const { professorId } = req.params;

    const sql = `
        SELECT 
            t.id, t.titulo, t.materia, t.descricao, t.link, t.banner, t.data_criacao,
            COUNT(ta.aluno_id)   AS totalAlunos,
            SUM(ta.concluida)    AS totalConcluidas
        FROM tarefas t
        LEFT JOIN tarefa_aluno ta ON t.id = ta.tarefa_id
        WHERE t.professor_id = ?
        GROUP BY t.id
        ORDER BY t.data_criacao DESC
    `;

    conexao.query(sql, [professorId], (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
        res.json({ tarefas: resultado });
    });
});

// ════════════════════════════════════════════════
// MARCAR TAREFA COMO CONCLUÍDA
// ════════════════════════════════════════════════
app.post("/tarefas/concluir", (req, res) => {
    const { tarefaId, alunoId } = req.body;

    if (!tarefaId || !alunoId) {
        return res.status(400).json({ mensagem: "tarefaId e alunoId são obrigatórios." });
    }

    const sql = `
        UPDATE tarefa_aluno 
        SET concluida = 1, data_conclusao = NOW()
        WHERE tarefa_id = ? AND aluno_id = ?
    `;

    conexao.query(sql, [tarefaId, alunoId], (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
        if (resultado.affectedRows === 0)
            return res.status(404).json({ mensagem: "Vínculo tarefa-aluno não encontrado." });
        res.json({ mensagem: "Tarefa marcada como concluída!" });
    });
});

// ════════════════════════════════════════════════
// ESTATÍSTICAS GERAIS
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
        FROM usuarios WHERE tipo = 'aluno'
    `;

    const sqlProfessores = `
        SELECT COUNT(*) AS totalProfessores FROM usuarios
        WHERE tipo IN ('professor', 'coordenador', 'apoio')
    `;

    conexao.query(sqlAlunos, (erro, resAlunos) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });

        conexao.query(sqlProfessores, (erro, resProfs) => {
            if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });

            res.json({
                totalAlunos: resAlunos[0].totalAlunos,
                totalProfessores: resProfs[0].totalProfessores,
                progressoMedio: Math.round(resAlunos[0].progressoMedio || 0),
                condicoes: {
                    Visual: resAlunos[0].visual,
                    Auditiva: resAlunos[0].auditiva,
                    Cognitiva: resAlunos[0].cognitiva,
                    Fisica: resAlunos[0].fisica,
                    Nenhuma: resAlunos[0].nenhuma
                }
            });
        });
    });
});

// ════════════════════════════════════════════════
// TURMAS POR EDUCADOR
// ════════════════════════════════════════════════
app.get("/escola/turmas", (req, res) => {
    const sql = `
        SELECT
            u.nome AS professor, u.disciplina,
            COUNT(pa.aluno_id)  AS totalAlunos,
            AVG(al.progresso)   AS progressoMedio
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
// ════  BOLETIM  ══════════════════════════════════
// ════════════════════════════════════════════════

// Salvar / atualizar nota (professor)
app.post("/boletim", (req, res) => {
    const { professorId, alunoId, materia, nota, bimestre } = req.body;

    if (!professorId || !alunoId || !materia || nota === undefined || nota === null) {
        return res.status(400).json({ mensagem: "professorId, alunoId, materia e nota são obrigatórios." });
    }

    if (nota < 0 || nota > 10) {
        return res.status(400).json({ mensagem: "A nota deve ser entre 0 e 10." });
    }

    const sql = `
        INSERT INTO boletim (aluno_id, professor_id, materia, nota, bimestre)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE nota = VALUES(nota), professor_id = VALUES(professor_id), atualizado_em = NOW()
    `;

    conexao.query(sql, [alunoId, professorId, materia, nota, bimestre || 1], (erro) => {
        if (erro) return res.status(500).json({ mensagem: "Erro ao salvar nota." });
        res.json({ mensagem: "Nota salva com sucesso!" });
    });
});

// Buscar boletim completo de um aluno (por bimestre)
app.get("/boletim/:alunoId", (req, res) => {
    const { alunoId } = req.params;
    const bimestre = req.query.bimestre || 1;

    const sql = `
        SELECT b.materia, b.nota, b.bimestre, b.atualizado_em,
               u.nome AS professor
        FROM boletim b
        INNER JOIN usuarios u ON b.professor_id = u.id
        WHERE b.aluno_id = ? AND b.bimestre = ?
        ORDER BY b.materia
    `;

    conexao.query(sql, [alunoId, bimestre], (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
        res.json({ boletim: resultado });
    });
});

// Buscar boletim de todos os alunos de um professor (para edição)
app.get("/boletim/professor/:professorId/aluno/:alunoId", (req, res) => {
    const { professorId, alunoId } = req.params;
    const bimestre = req.query.bimestre || 1;

    // Retorna todas as matérias com nota (null se não lançada ainda)
    const materias = [
        'Português', 'Matemática', 'História', 'Geografia',
        'Ciências', 'Inglês', 'Educação Física', 'Artes'
    ];

    const sql = `
        SELECT b.materia, b.nota, b.bimestre
        FROM boletim b
        WHERE b.aluno_id = ? AND b.professor_id = ? AND b.bimestre = ?
    `;

    conexao.query(sql, [alunoId, professorId, bimestre], (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });

        // Combina matérias fixas com notas existentes
        const notasMap = {};
        resultado.forEach((r) => { notasMap[r.materia] = r.nota; });

        const boletimCompleto = materias.map(m => ({
            materia: m,
            nota: notasMap[m] !== undefined ? notasMap[m] : null
        }));

        res.json({ boletim: boletimCompleto });
    });
});

// ════════════════════════════════════════════════
// ════  RECADOS  ══════════════════════════════════
// ════════════════════════════════════════════════

// Enviar recado (professor → aluno específico ou todos)
app.post("/recados", (req, res) => {
    const { professorId, alunoId, titulo, mensagem } = req.body;

    if (!professorId || !titulo || !mensagem) {
        return res.status(400).json({ mensagem: "professorId, titulo e mensagem são obrigatórios." });
    }

    // Se alunoId for null/undefined → recado para todos os alunos do professor
    if (alunoId) {
        // Recado individual
        const sql = `INSERT INTO recados (professor_id, aluno_id, titulo, mensagem) VALUES (?, ?, ?, ?)`;
        conexao.query(sql, [professorId, alunoId, titulo, mensagem], (erro, resultado) => {
            if (erro) return res.status(500).json({ mensagem: "Erro ao enviar recado." });
            res.json({ mensagem: "Recado enviado com sucesso!", id: resultado.insertId });
        });
    } else {
        // Recado para todos os alunos vinculados
        conexao.query(
            `SELECT aluno_id FROM professor_aluno WHERE professor_id = ?`,
            [professorId],
            (erro, alunos) => {
                if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
                if (alunos.length === 0)
                    return res.status(400).json({ mensagem: "Nenhum aluno vinculado." });

                const valores = alunos.map((a) => [professorId, a.aluno_id, titulo, mensagem]);
                conexao.query(
                    `INSERT INTO recados (professor_id, aluno_id, titulo, mensagem) VALUES ?`,
                    [valores],
                    (erro) => {
                        if (erro) return res.status(500).json({ mensagem: "Erro ao enviar recados." });
                        res.json({ mensagem: `Recado enviado para ${alunos.length} aluno(s)!` });
                    }
                );
            }
        );
    }
});

// Buscar recados do aluno
app.get("/recados/aluno/:alunoId", (req, res) => {
    const { alunoId } = req.params;

    const sql = `
        SELECT r.id, r.titulo, r.mensagem, r.lido, r.criado_em,
               u.nome AS professor
        FROM recados r
        INNER JOIN usuarios u ON r.professor_id = u.id
        WHERE r.aluno_id = ?
        ORDER BY r.criado_em DESC
    `;

    conexao.query(sql, [alunoId], (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
        res.json({ recados: resultado });
    });
});

// Buscar recados enviados pelo professor
app.get("/recados/professor/:professorId", (req, res) => {
    const { professorId } = req.params;

    const sql = `
        SELECT r.id, r.titulo, r.mensagem, r.lido, r.criado_em,
               u.nome AS aluno
        FROM recados r
        INNER JOIN usuarios u ON r.aluno_id = u.id
        WHERE r.professor_id = ?
        ORDER BY r.criado_em DESC
    `;

    conexao.query(sql, [professorId], (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
        res.json({ recados: resultado });
    });
});

// Marcar recado como lido
app.post("/recados/ler/:id", (req, res) => {
    conexao.query(
        `UPDATE recados SET lido = 1 WHERE id = ?`,
        [req.params.id],
        (erro) => {
            if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
            res.json({ mensagem: "Recado marcado como lido." });
        }
    );
});

// ════════════════════════════════════════════════
// MATERIAIS
// ════════════════════════════════════════════════

// Criar material
app.post("/materiais", (req, res) => {
    const { professorId, titulo, descricao, tipo, url, banner, materia, alunosIds } = req.body;
    if (!professorId || !titulo || !url || !tipo) {
        return res.status(400).json({ mensagem: "Campos obrigatórios: professorId, titulo, url, tipo." });
    }
    if (!alunosIds || alunosIds.length === 0) {
        return res.status(400).json({ mensagem: "Selecione pelo menos um aluno." });
    }
    const sql = `INSERT INTO materiais (professor_id, titulo, descricao, tipo, url, banner, materia) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    conexao.query(sql, [professorId, titulo, descricao || '', tipo, url, banner || null, materia || null], (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: "Erro ao criar material." });
        const materialId = resultado.insertId;
        const valores = alunosIds.map(id => [materialId, id]);
        conexao.query(`INSERT INTO material_aluno (material_id, aluno_id) VALUES ?`, [valores], (erro) => {
            if (erro) return res.status(500).json({ mensagem: "Material criado, mas erro ao vincular alunos." });
            res.json({ mensagem: "Material publicado com sucesso!", materialId });
        });
    });
});

// Buscar materiais do aluno
app.get("/materiais/aluno/:alunoId", (req, res) => {
    const { alunoId } = req.params;
    const sql = `
        SELECT m.id, m.titulo, m.descricao, m.tipo, m.url, m.banner, m.materia, m.data_criacao,
               u.nome AS professor
        FROM materiais m
        INNER JOIN material_aluno ma ON m.id = ma.material_id
        INNER JOIN usuarios u ON m.professor_id = u.id
        WHERE ma.aluno_id = ?
        ORDER BY m.data_criacao DESC
    `;
    conexao.query(sql, [alunoId], (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
        res.json({ materiais: resultado });
    });
});

// Buscar materiais do professor
app.get("/materiais/professor/:professorId", (req, res) => {
    const { professorId } = req.params;
    const sql = `
        SELECT m.id, m.titulo, m.descricao, m.tipo, m.url, m.banner, m.materia, m.data_criacao,
               COUNT(ma.aluno_id) AS totalAlunos
        FROM materiais m
        LEFT JOIN material_aluno ma ON m.id = ma.material_id
        WHERE m.professor_id = ?
        GROUP BY m.id
        ORDER BY m.data_criacao DESC
    `;
    conexao.query(sql, [professorId], (erro, resultado) => {
        if (erro) return res.status(500).json({ mensagem: "Erro no servidor." });
        res.json({ materiais: resultado });
    });
});


// ════════════════════════════════════════════════
// SERVIDOR
// ════════════════════════════════════════════════
app.listen(3000, () => {
    console.log("✅ Servidor EducaInclusiva rodando na porta 3000");
});
"use client";

import { FormEvent, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { USER_ROLES } from "@/lib/constants";
import { deleteUser, getUsers, saveUser } from "@/lib/storage";
import type { User, UserRole } from "@/lib/types";
import { useAuthGuard } from "@/lib/use-auth-guard";

export default function UsersPage() {
  const { loading } = useAuthGuard(["Administrador"]);
  const [users, setUsers] = useState<User[]>(() => getUsers());
  const [editing, setEditing] = useState<User | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState<UserRole>("Perito");
  const [message, setMessage] = useState<string | null>(null);

  const sortedUsers = useMemo(() => [...users].sort((a, b) => a.nome.localeCompare(b.nome)), [users]);

  if (loading) return <LoadingState />;

  function resetForm() {
    setEditing(null);
    setNome("");
    setEmail("");
    setSenha("");
    setTipo("Perito");
  }

  function startEdit(user: User) {
    setEditing(user);
    setNome(user.nome);
    setEmail(user.email);
    setSenha("");
    setTipo(user.tipo);
  }

  function handleDelete(userEmail: string) {
    const shouldDelete = window.confirm("Excluir este usuario?");
    if (!shouldDelete) return;
    deleteUser(userEmail);
    setUsers(getUsers());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nome.trim() || !email.trim()) {
      setMessage("Nome e email sao obrigatorios.");
      return;
    }
    if (!editing && !senha.trim()) {
      setMessage("Senha e obrigatoria para novos usuarios.");
      return;
    }

    const existing = users.find((item) => item.email === email && item.email !== editing?.email);
    if (existing) {
      setMessage("Ja existe um usuario com este email.");
      return;
    }

    saveUser({
      id: editing?.id || email,
      nome: nome.trim(),
      email: email.trim(),
      senha: senha.trim() || editing?.senha,
      tipo
    });
    setMessage(editing ? "Usuario atualizado com sucesso." : "Usuario cadastrado com sucesso.");
    resetForm();
    setUsers(getUsers());
  }

  return (
    <>
      <header className="page-header">
        <div className="page-title">
          <span className="page-kicker">Administracao</span>
          <h1>Gerenciar usuarios</h1>
          <p>Cadastro local migrado do antigo fluxo em JavaScript. Para producao, esta area deve ser ligada a autenticacao real no backend.</p>
        </div>
      </header>

      <div className="two-column">
        <form className="panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h2>{editing ? "Editar usuario" : "Novo usuario"}</h2>
          </div>

          {message ? <div className={message.includes("sucesso") ? "alert success" : "alert error"}>{message}</div> : null}

          <div className="grid">
            <label className="form-field">
              <span>Nome</span>
              <input value={nome} onChange={(event) => setNome(event.target.value)} required />
            </label>
            <label className="form-field">
              <span>Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="form-field">
              <span>Senha</span>
              <input type="password" value={senha} onChange={(event) => setSenha(event.target.value)} placeholder={editing ? "Deixe em branco para manter" : ""} />
            </label>
            <label className="form-field">
              <span>Tipo</span>
              <select value={tipo} onChange={(event) => setTipo(event.target.value as UserRole)}>
                {USER_ROLES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-actions">
            {editing ? (
              <button className="secondary-button" type="button" onClick={resetForm}>
                Cancelar
              </button>
            ) : null}
            <button className="primary-button" type="submit">
              {editing ? "Atualizar" : "Cadastrar"}
            </button>
          </div>
        </form>

        <section className="panel">
          <div className="panel-header">
            <h2>Usuarios cadastrados</h2>
            <span className="muted-text">{sortedUsers.length} usuario(s)</span>
          </div>

          {sortedUsers.length === 0 ? (
            <EmptyState title="Nenhum usuario cadastrado" />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Tipo</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((user) => (
                    <tr key={user.email}>
                      <td>{user.nome}</td>
                      <td>{user.email}</td>
                      <td>{user.tipo}</td>
                      <td>
                        <div className="toolbar">
                          <button className="secondary-button" type="button" onClick={() => startEdit(user)}>
                            Editar
                          </button>
                          <button className="danger-button" type="button" onClick={() => handleDelete(user.email)}>
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

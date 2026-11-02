import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { adminApi, userApi } from "../api";
import Avatar from "../components/Avatar";
import type { Permission, Role, User } from "../types";

type Tab = "users" | "roles" | "permissions";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [perms, setPerms] = useState<Permission[]>([]);
  const [error, setError] = useState("");
  const [roleForm, setRoleForm] = useState({ name: "", description: "", permissions: [] as string[] });
  const [permForm, setPermForm] = useState({ name: "", description: "" });

  const run = useCallback(async (fn: () => Promise<unknown>) => {
    setError("");
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : "Có lỗi xảy ra"); }
  }, []);

  const load = useCallback(() => run(async () => {
    const [u, r, p] = await Promise.all([userApi.all(), adminApi.roles(), adminApi.permissions()]);
    setUsers(u); setRoles(r); setPerms(p);
  }), [run]);

  useEffect(() => { void load(); }, [load]);

  const addRole = (e: FormEvent) => { e.preventDefault(); void run(async () => { await adminApi.createRole(roleForm); setRoleForm({ name: "", description: "", permissions: [] }); await load(); }); };
  const addPerm = (e: FormEvent) => { e.preventDefault(); void run(async () => { await adminApi.createPermission(permForm); setPermForm({ name: "", description: "" }); await load(); }); };
  const delUser = (u: User) => confirm(`Xóa người dùng "${u.username}"?`) && run(async () => { await userApi.remove(u.id); await load(); });

  return (
    <main className="page wide">
      <Link to="/" className="back">← Quay lại tin nhắn</Link>
      <h1>Quản trị</h1>
      <div className="tabs" role="tablist">
        {(["users", "roles", "permissions"] as Tab[]).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "tab on" : "tab"} onClick={() => setTab(t)}>
            {{ users: `Người dùng (${users.length})`, roles: `Vai trò (${roles.length})`, permissions: `Quyền (${perms.length})` }[t]}
          </button>
        ))}
      </div>
      {error && <p className="error" role="alert">{error}</p>}

      {tab === "users" && (
        <table className="table">
          <thead><tr><th>Người dùng</th><th>Email</th><th>Vai trò</th><th /></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><span className="row"><Avatar src={u.avatar} name={u.username} size={30} />{u.username}</span></td>
                <td>{u.email}</td>
                <td>{u.roles?.map((r) => r.name).join(", ")}</td>
                <td><button className="btn danger" onClick={() => delUser(u)}>Xóa</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "roles" && (
        <>
          <form className="form inline" onSubmit={addRole}>
            <input placeholder="Tên vai trò" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} required />
            <input placeholder="Mô tả" value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} />
            <select multiple value={roleForm.permissions} onChange={(e) => setRoleForm({ ...roleForm, permissions: [...e.target.selectedOptions].map((o) => o.value) })} aria-label="Quyền">
              {perms.map((p) => <option key={p.name}>{p.name}</option>)}
            </select>
            <button className="btn primary">Thêm vai trò</button>
          </form>
          <table className="table">
            <thead><tr><th>Vai trò</th><th>Mô tả</th><th>Quyền</th><th /></tr></thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.name}>
                  <td>{r.name}</td><td>{r.description}</td><td>{r.permissions?.map((p) => p.name).join(", ")}</td>
                  <td><button className="btn danger" onClick={() => run(async () => { await adminApi.deleteRole(r.name); await load(); })}>Xóa</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === "permissions" && (
        <>
          <form className="form inline" onSubmit={addPerm}>
            <input placeholder="Tên quyền" value={permForm.name} onChange={(e) => setPermForm({ ...permForm, name: e.target.value })} required />
            <input placeholder="Mô tả" value={permForm.description} onChange={(e) => setPermForm({ ...permForm, description: e.target.value })} />
            <button className="btn primary">Thêm quyền</button>
          </form>
          <table className="table">
            <thead><tr><th>Quyền</th><th>Mô tả</th><th /></tr></thead>
            <tbody>
              {perms.map((p) => (
                <tr key={p.name}>
                  <td>{p.name}</td><td>{p.description}</td>
                  <td><button className="btn danger" onClick={() => run(async () => { await adminApi.deletePermission(p.name); await load(); })}>Xóa</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}

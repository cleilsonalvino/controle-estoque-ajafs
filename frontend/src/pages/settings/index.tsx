import { useEmpresa } from "@/contexts/EmpresaContext";
import { useAuth } from "@/contexts/useAuth";
import { useUsers } from "@/contexts/UsersContext";
import { EmpresaSection } from "./EmpresaSection";
import { UsersSection } from "./UsersSection";
import { UserModal } from "./UserModal";
import { getGroupedMenuPermissions } from "./permissions";
import { useState } from "react";
import { UserDetailsModal } from "./UserDetailsModal";

const Settings = () => {
  const { empresa, updateEmpresa } = useEmpresa();
  const { user: userLogado } = useAuth();

  // 🔥 agora vem tudo do contexto
  const {
    usuarios,
    listarUsuarios,
    buscarUsuarioPorId,
    criarUsuario,
    atualizarUsuario,
    excluirUsuario,
  } = useUsers();

  const [editingUser, setEditingUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsUser, setDetailsUser] = useState(null);

  const handleShowDetails = (user) => {
    setDetailsUser(user);
    setDetailsOpen(true);
  };

  const groupedPermissions = getGroupedMenuPermissions();

  // 👉 Abrir modal para criar
  const handleNewUser = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  // 👉 Abrir modal para editar
  const handleEditUser = async (user) => {
    const completo = await buscarUsuarioPorId(user.id);
    setEditingUser(completo);
    setModalOpen(true);
  };

  // 👉 Excluir
  const handleDeleteUser = async (id) => {
    await excluirUsuario(id);
  };

  // 👉 Criar ou atualizar
  const handleSubmitUser = async (data) => {
    const fd = new FormData();

    // Preencher FormData
    Object.entries(data).forEach(([key, value]) => {
      if (key === "urlImagem") {
        if (value && value[0]) fd.append("urlImagem", value[0]);
      } else {
        fd.append(
          key,
          Array.isArray(value) ? JSON.stringify(value) : String(value)
        );
      }
    });

    if (editingUser) {
      await atualizarUsuario(editingUser.id, fd);
    } else {
      await criarUsuario(fd);
    }

    listarUsuarios();
    setModalOpen(false);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Empresa */}
      <EmpresaSection
        empresa={empresa}
        onSave={(data) => updateEmpresa(data, empresa.id)}
      />

      {/* Lista de usuários */}
      <UsersSection
        users={usuarios}
        userLogado={userLogado}
        onNew={handleNewUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onDetails={handleShowDetails}

      />

      {/* Modal de criação/edição */}
      <UserModal
        open={modalOpen}
        user={editingUser}
        groupedPermissions={groupedPermissions}
        userLogado={userLogado}
        onSubmit={handleSubmitUser}
        onClose={() => setModalOpen(false)}
      />
      <UserDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        user={detailsUser}
        groupedPermissions={groupedPermissions}
      />
    </div>
  );
};

export default Settings;

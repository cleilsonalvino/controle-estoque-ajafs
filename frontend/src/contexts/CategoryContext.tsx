import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export interface Category {
  id: string;
  nome: string;
  descricao: string;
}

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  fetchCategories: () => Promise<void>;
  createCategory: (newCategory: Omit<Category, "id">) => Promise<Category | undefined>;
  updateCategory: (id: string, updatedCategory: Omit<Category, "id">) => Promise<Category | undefined>;
  deleteCategory: (id: string) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType>({
  categories: [],
  loading: false,
  fetchCategories: async () => {},
  createCategory: async () => undefined,
  updateCategory: async () => undefined,
  deleteCategory: async () => {},
});

interface CategoryProviderProps {
  children: ReactNode;
}

export const CategoryProvider = ({ children }: CategoryProviderProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Category[]>("/categorias");
      setCategories(data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (newCategory: Omit<Category, "id">) => {
    try {
      const { data } = await api.post<Category>("/categorias/create", newCategory);
      setCategories((prev) => [...prev, data]);
      toast.success("Categoria criada com sucesso!");
      return data;
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      toast.error("Erro ao criar categoria");
    }
  };

  const updateCategory = async (id: string, updatedCategory: Omit<Category, "id">) => {
    try {
      const { data } = await api.put<Category>(`/categorias/${id}`, updatedCategory);
      setCategories((prev) => prev.map((c) => (c.id === id ? data : c)));
      toast.success("Categoria atualizada com sucesso!");
      return data;
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      toast.error("Erro ao atualizar categoria");
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await api.delete(`/categorias/delete/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Categoria removida!");
    } catch (error) {
      console.error("Erro ao deletar categoria:", error);
      toast.error("Erro ao deletar categoria");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => useContext(CategoryContext);

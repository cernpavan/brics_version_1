import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminRoute } from "@/components/admin/AdminRoute";

const AdminMessages = () => {
  return (
    <AdminRoute requiredRole="admin">
      <AdminLayout>
        <div>
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-slate-400">Coming soon</p>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default AdminMessages;






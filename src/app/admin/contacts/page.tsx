"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Search,
  Eye,
  Trash2,
  Mail,
  Phone,
  Calendar,
  User,
  CheckCircle,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  created_at: string;
}

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0123456789",
    subject: "Hỏi về loa JBL Charge 5",
    message:
      "Xin chào, tôi muốn hỏi về thông số kỹ thuật của loa JBL Charge 5. Loa này có chống nước không ạ?",
    status: "unread",
    created_at: "2025-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Trần Thị B",
    email: "tranthib@email.com",
    phone: "0987654321",
    subject: "Tư vấn tai nghe Sony",
    message:
      "Em muốn mua tai nghe Sony WH-1000XM4, không biết có còn hàng không ạ? Giá bao nhiêu?",
    status: "read",
    created_at: "2025-01-14T15:45:00Z",
  },
  {
    id: "3",
    name: "Lê Văn C",
    email: "levanc@email.com",
    phone: "0555666777",
    subject: "Bảo hành sản phẩm",
    message:
      "Tôi đã mua loa ở shop cách đây 6 tháng, giờ có vấn đề về âm thanh. Làm sao để bảo hành ạ?",
    status: "replied",
    created_at: "2025-01-13T09:20:00Z",
  },
];

const statusConfig = {
  unread: { label: "Chưa đọc", color: "bg-red-100 text-red-800", icon: Mail },
  read: { label: "Đã đọc", color: "bg-yellow-100 text-yellow-800", icon: Eye },
  replied: {
    label: "Đã trả lời",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setContacts(mockContacts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const updateContactStatus = (
    contactId: string,
    newStatus: Contact["status"],
  ) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === contactId ? { ...contact, status: newStatus } : contact,
      ),
    );
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Quản lý liên hệ"
        description="Xem và trả lời các tin nhắn từ khách hàng"
        breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Liên hệ" }]}
      />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, chủ đề..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="unread">Chưa đọc</option>
                <option value="read">Đã đọc</option>
                <option value="replied">Đã trả lời</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Danh sách liên hệ ({filteredContacts.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner text="Đang tải tin nhắn..." />
            </div>
          ) : filteredContacts.length > 0 ? (
            <div className="space-y-4">
              {filteredContacts.map((contact, index) => {
                const StatusIcon = statusConfig[contact.status].icon;
                return (
                  <motion.div
                    key={contact.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              {contact.name}
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[contact.status].color}`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[contact.status].label}
                          </span>
                        </div>

                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {contact.subject}
                        </h3>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {contact.message}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {contact.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {contact.phone}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(contact.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {contact.status === "unread" && (
                          <button
                            onClick={() =>
                              updateContactStatus(contact.id, "read")
                            }
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                            title="Đánh dấu đã đọc"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}

                        {contact.status !== "replied" && (
                          <button
                            onClick={() =>
                              updateContactStatus(contact.id, "replied")
                            }
                            className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50"
                            title="Đánh dấu đã trả lời"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Chưa có tin nhắn nào"
              description="Chưa có tin nhắn nào từ khách hàng. Tin nhắn sẽ xuất hiện ở đây khi khách hàng gửi liên hệ."
            />
          )}
        </div>
      </div>
    </div>
  );
}

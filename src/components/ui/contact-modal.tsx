'use client';

import React from 'react';
import { X, Phone, Mail, MessageCircle, MapPin } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

export default function ContactModal({ isOpen, onClose, productName }: ContactModalProps) {
  if (!isOpen) return null;

  const contactMethods = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Điện thoại',
      value: process.env.NEXT_PUBLIC_CONTACT_PHONE || '0934995657',
      href: `tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE || '0934995657'}`,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Zalo',
      value: process.env.NEXT_PUBLIC_CONTACT_PHONE || '0934995657',
      href: `https://zalo.me/${process.env.NEXT_PUBLIC_CONTACT_PHONE || '0934995657'}`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email',
      value: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@tiendataudio.com',
      href: `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}?subject=${encodeURIComponent(
        `Hỏi về ${productName || 'sản phẩm'}`
      )}`,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Địa chỉ',
      value: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || 'Quảng Ngãi, Việt Nam',
      href: `https://maps.google.com/?q=${encodeURIComponent(
        process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || 'Quảng Ngãi, Việt Nam'
      )}`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Liên hệ tư vấn</h2>
            {productName && (
              <p className="text-sm text-gray-600 mt-1">
                Sản phẩm: <span className="font-medium">{productName}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6 text-center">
            Chúng tôi sẵn sàng tư vấn và hỗ trợ bạn tìm giải pháp âm thanh phù hợp nhất!
          </p>

          <div className="space-y-4">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className={`p-3 rounded-full ${method.bgColor} ${method.color} group-hover:scale-110 transition-transform`}>
                  {method.icon}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-medium text-gray-900">{method.title}</h3>
                  <p className="text-gray-600 text-sm">{method.value}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-orange-800">Lưu ý</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Chúng tôi hoạt động từ 8:00 - 18:00 hàng ngày. Ngoài giờ này, vui lòng để lại tin nhắn!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

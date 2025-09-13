'use client'

import Link from "next/link"
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react"
import { motion } from 'framer-motion'

export default function Footer() {
    const footerSections = [
        {
            title: "Sản phẩm",
            links: [
                { name: "Loa", href: "/san-pham?category=loa" },
                { name: "Amply", href: "/san-pham?category=amply" },
                { name: "Micro", href: "/san-pham?category=micro" },
                { name: "Mixer", href: "/san-pham?category=mixer" },
            ]
        },
        {
            title: "Thông tin",
            links: [
                { name: "Về chúng tôi", href: "/gioi-thieu" },
                { name: "Liên hệ", href: "/lien-he" },
                { name: "Tư vấn", href: "/tu-van" },
                { name: "Bảo hành", href: "/bao-hanh" },
            ]
        },
        {
            title: "Hỗ trợ",
            links: [
                { name: "Hướng dẫn sử dụng", href: "/huong-dan" },
                { name: "FAQ", href: "/faq" },
                { name: "Chính sách đổi trả", href: "/chinh-sach" },
                { name: "Bảo mật", href: "/bao-mat" },
            ]
        }
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6
            }
        }
    }

    return (
        <motion.footer
            className="bg-gray-900 text-white"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <motion.div variants={itemVariants} className="lg:col-span-1">
                        <motion.div
                            className="flex items-center space-x-2 mb-4"
                            whileHover={{ scale: 1.02 }}
                        >
                            <motion.div
                                className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center"
                                whileHover={{ rotate: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <span className="text-white font-bold text-xl">T</span>
                            </motion.div>
                            <div>
                                <h3 className="text-xl font-bold">Tiến Đạt Audio</h3>
                                <p className="text-sm text-gray-400">Thiết bị âm thanh chuyên nghiệp</p>
                            </div>
                        </motion.div>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            Chuyên cung cấp các thiết bị âm thanh chất lượng cao với dịch vụ tư vấn chuyên nghiệp,
                            mang đến trải nghiệm âm thanh tuyệt vời cho khách hàng.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <motion.div
                                className="flex items-center space-x-3"
                                whileHover={{ x: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Phone className="h-5 w-5 text-blue-400" />
                                <span className="text-gray-300">+84 123 456 789</span>
                            </motion.div>
                            <motion.div
                                className="flex items-center space-x-3"
                                whileHover={{ x: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Mail className="h-5 w-5 text-blue-400" />
                                <span className="text-gray-300">info@tiendataudio.com</span>
                            </motion.div>
                            <motion.div
                                className="flex items-center space-x-3"
                                whileHover={{ x: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <MapPin className="h-5 w-5 text-blue-400" />
                                <span className="text-gray-300">123 Đường ABC, Quận XYZ, TP.HCM</span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Footer Sections */}
                    {footerSections.map((section, sectionIndex) => (
                        <motion.div
                            key={section.title}
                            variants={itemVariants}
                            className="lg:col-span-1"
                        >
                            <h3 className="text-lg font-semibold mb-4 text-white">{section.title}</h3>
                            <ul className="space-y-2">
                                {section.links.map((link, linkIndex) => (
                                    <motion.li
                                        key={link.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: sectionIndex * 0.1 + linkIndex * 0.05 }}
                                        viewport={{ once: true }}
                                    >
                                        <Link
                                            href={link.href}
                                            className="text-gray-400 hover:text-white transition-colors duration-200 relative group"
                                        >
                                            <motion.span
                                                whileHover={{ x: 5 }}
                                                transition={{ duration: 0.2 }}
                                                className="inline-block"
                                            >
                                                {link.name}
                                            </motion.span>
                                            <motion.div
                                                className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300"
                                                whileHover={{ width: "100%" }}
                                            />
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Social Media & Copyright */}
                <motion.div
                    className="border-t border-gray-800 mt-12 pt-8"
                    variants={itemVariants}
                >
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <motion.div
                            className="flex space-x-6 mb-4 md:mb-0"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {[
                                { icon: Facebook, href: "#", label: "Facebook" },
                                { icon: Instagram, href: "#", label: "Instagram" },
                                { icon: Youtube, href: "#", label: "YouTube" }
                            ].map((social) => (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    className="text-gray-400 hover:text-white transition-colors duration-200"
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-6 w-6" />
                                </motion.a>
                            ))}
                        </motion.div>

                        <motion.div
                            className="text-center md:text-right"
                            variants={itemVariants}
                        >
                            <p className="text-gray-400 text-sm">
                                © 2024 Tiến Đạt Audio. Tất cả quyền được bảo lưu.
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                                Thiết kế bởi Tiến Đạt Team
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </motion.footer>
    )
}

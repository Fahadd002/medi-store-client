import Link from 'next/link'
import { Pill, Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Pill className="h-8 w-8 text-emerald-500" />
              <span className="text-xl font-bold text-white">MediStore</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Your trusted online pharmacy for genuine medicines with cash on delivery.
            </p>
            <div className="flex gap-3">
              <Link href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors">
                <Facebook className="h-4 w-4" />
              </Link>
              <Link href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="hover:text-emerald-400 transition-colors">
                  Medicines
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-emerald-400 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/sellers" className="hover:text-emerald-400 transition-colors">
                  Sellers
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-emerald-400 transition-colors">
                  Health Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="hover:text-emerald-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-emerald-400 transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-emerald-400 transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-emerald-500 mt-0.5" />
                <span>123 Medical Street, Health City, HC 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-emerald-500" />
                <span>+1 234 567 890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-emerald-500" />
                <span>support@medistore.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© {currentYear} MediStore. All rights reserved.</p>
            <div className="flex items-center gap-1 mt-2 md:mt-0">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-500 fill-red-500" />
              <span>for better health</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
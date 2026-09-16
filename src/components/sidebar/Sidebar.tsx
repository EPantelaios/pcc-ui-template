import { useAuth } from '@/auth/useAuth'
import SidebarNavItem from '@/components/sidebar/SidebarNavItem'
import SidebarHeader from '@/components/sidebar/SidebarHeader'
import SidebarFooter from '@/components/sidebar/SidebarFooter'
import Button from '@/components/Button'

interface SidebarProps {
  isMobileMenuOpen: boolean
  onCloseMobileMenu: () => void
}

const Sidebar = ({ isMobileMenuOpen, onCloseMobileMenu }: SidebarProps) => {
  const { authenticated, login, logout } = useAuth()

  return (
    <aside
      className={`w-56 md:w-60 xl:w-68 2xl:w-72 bg-surface-muted border-r border-line flex flex-col fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen
          ? 'translate-x-0'
          : '-translate-x-full md:translate-x-0'
      }`}
    >
      <SidebarHeader onCloseMobileMenu={onCloseMobileMenu} />

      <nav className="flex flex-1 flex-col gap-1 p-4">
        <SidebarNavItem to="/" label="Home" onClick={onCloseMobileMenu} />
      </nav>

      {authenticated ? (
        <SidebarFooter onLogout={logout} />
      ) : (
        <div className="border-t border-line p-4">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => login()}
          >
            Log in
          </Button>
        </div>
      )}
    </aside>
  )
}

export default Sidebar

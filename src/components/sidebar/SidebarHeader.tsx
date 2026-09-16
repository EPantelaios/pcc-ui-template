import { Link } from 'react-router-dom'
import { XMarkIcon } from '@heroicons/react/16/solid'

interface SidebarHeaderProps {
  onCloseMobileMenu: () => void
}

const SidebarHeader = ({ onCloseMobileMenu }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-1 border-b border-line px-4 py-4">
      <Link to="/" className="text-lg font-bold text-foreground">
        Logo
      </Link>

      <button
        aria-label="Close menu"
        className="cursor-pointer rounded-lg p-1 text-muted transition-colors hover:bg-surface-strong md:hidden"
        onClick={onCloseMobileMenu}
      >
        <XMarkIcon className="size-6" />
      </button>
    </div>
  )
}

export default SidebarHeader

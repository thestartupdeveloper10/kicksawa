import { Link } from 'react-router-dom';

const Footer_Nav = ({ theme }) => {
  const navItems = [
    { name: 'HOME', path: '/' },
    { name: 'SHOP', path: '/products' },
    { name: 'BRANDS', path: '/brands' },
    { name: 'MY ACCOUNT', path: '/my-account' },
    { name: 'CONTACT US', path: '/contact-us' }
  ];

  return (
    <nav>
      <ul className="flex flex-col">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link 
              to={item.path} 
              className={`text-sm hover:underline ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Footer_Nav;
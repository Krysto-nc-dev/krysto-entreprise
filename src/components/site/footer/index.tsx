import React from 'react';

type Props = {
  title: string;
  description: string;
};

const Footer = ({ title, description }: Props) => {

  // Define a base style for all themes
  const baseStyle = "border-t border-gray-700 flex items-start justify-between flex-col p-3";

  // Conditionally apply styles based on the theme
  

  return (
    <footer className={`${baseStyle} w-full h-[200px] mt-[60px]`}>
      <h1 className="text-lg font-bold">Fllux</h1>
      <div className="flex items-center justify-center w-full  mb-8 ">
        <ul className="w-[30%]">
            <li>item 1</li>
            <li>item 1</li>
            <li>item 1</li>
            <li>item 1</li>
            <li>item 1</li>
            <li>item 1</li>
           
        </ul>
        <ul className="w-[30%]">
            <li>item 1</li>
            <li>item 1</li>
            <li>item 1</li>
            <li>item 1</li>
            <li>item 1</li>
            <li>item 1</li>
           
        </ul>
        <ul className="w-[30%]">
            <li>item 1</li>
            <li>item 1</li>
            <li>item 1</li>
            <li>item 1</li>
            <li>item 1</li>
            <li>item 1</li>
           
        </ul>
      </div>
      
      <p className= "text-center w-full">© {new Date().getFullYear()} Krysto tout droits réservé</p>
    </footer>
  );
};

export default Footer;

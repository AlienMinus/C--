// c:\m.1\My Progs\LexCodex\C--\src\components\ShellList.jsx
import React from 'react';
import { useShell } from '../context/ShellContext';
import CodeBlock from './CodeBlock';

const DEFAULT_CODE = `#include <stdio.h>

int main() {
    int n;
    printf("Enter Your Number: ");
    scanf("%d", &n);
    printf("Number is %d", n);
    return 0;
}`;

const ShellList = () => {
  const { shells } = useShell();

  return (
    <div style={{ 
      marginTop: '80px', 
      paddingBottom: '40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      {shells.map((shell, index) => (
        <CodeBlock key={shell.id} id={shell.id} defaultValue={index === 0 ? DEFAULT_CODE : ""} />
      ))}
    </div>
  );
};

export default ShellList;

import React from 'react';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children }: Readonly<PageHeaderProps>) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-[34px] font-medium text-mds-black-900">{title}</h1>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

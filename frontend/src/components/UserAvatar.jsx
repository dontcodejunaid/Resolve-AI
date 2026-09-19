import React, { useState } from 'react';
import { getAvatarForUser, getPersonaData } from '../utils/avatarUtils';

const sizeMap = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-base',
  '2xl': 'w-20 h-20 text-lg',
};

const badgeSizeMap = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4',
  '2xl': 'w-5 h-5',
};

export const UserAvatar = ({
  user,
  email,
  name,
  role,
  size = 'md',
  className = '',
  showBadge = false,
  badgeContent,
}) => {
  const [hasError, setHasError] = useState(false);
  
  const targetEmail = email || user?.email;
  const targetName = name || user?.full_name || targetEmail || 'User';
  const targetRole = role || user?.role;
  
  const persona = getPersonaData(targetEmail || { role: targetRole });
  const avatarSrc = getAvatarForUser(targetEmail || user || { role: targetRole });

  const initials = targetName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizeClasses = sizeMap[size] || sizeMap.md;
  const badgeClasses = badgeSizeMap[size] || badgeSizeMap.md;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {!hasError ? (
        <img
          src={avatarSrc}
          alt={targetName}
          onError={() => setHasError(true)}
          className={`${sizeClasses} rounded-full object-cover shadow-sm ring-1 ring-slate-200/80 bg-white`}
          loading="lazy"
        />
      ) : (
        <div
          className={`${sizeClasses} rounded-full flex items-center justify-center font-bold text-white shadow-sm ring-1 ring-white/50 ${
            persona?.bgColor || 'bg-slate-700'
          }`}
        >
          {initials || '?'}
        </div>
      )}

      {showBadge && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white flex items-center justify-center font-bold text-[8px] ${
            badgeContent
              ? 'px-1 bg-lime-500 text-slate-950 shadow-sm'
              : `${badgeClasses} ${
                  targetRole === 'merchant'
                    ? 'bg-lime-500'
                    : targetRole === 'employee'
                    ? 'bg-purple-500'
                    : targetRole === 'bank'
                    ? 'bg-sky-500'
                    : 'bg-blue-500'
                }`
          }`}
          title={targetRole}
        >
          {badgeContent || ''}
        </span>
      )}
    </div>
  );
};

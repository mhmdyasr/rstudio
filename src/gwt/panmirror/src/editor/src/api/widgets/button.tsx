/*
 * button.tsx
 *
 * Copyright (C) 2019-20 by RStudio, PBC
 *
 * Unless you have received this program directly from RStudio pursuant
 * to the terms of a commercial license agreement with RStudio, then
 * this program is licensed to you under the terms of version 3 of the
 * GNU Affero General Public License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
 *
 */

import React from 'react';

import { WidgetProps } from './react';

export interface LinkButtonProps extends WidgetProps {
  text: string;
  onClick: () => void;
  title?: string;
  maxWidth?: number;
}

export const LinkButton: React.FC<LinkButtonProps> = props => {
  const className = ['pm-link', 'pm-link-text-color'].concat(props.classes || []).join(' ');

  const style: React.CSSProperties = {
    ...props.style,
    maxWidth: props.maxWidth,
  };

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    props.onClick();
  };

  return (
    <a href={props.text} onClick={onClick} title={props.title || props.text} className={className} style={style}>
      {props.text}
    </a>
  );
};

export interface ImageButtonProps extends WidgetProps {
  title: string;
  image: string;
  onClick?: () => void;
}

export const ImageButton = React.forwardRef<HTMLButtonElement, ImageButtonProps>((props: ImageButtonProps, ref) => {
  const className = ['pm-image-button'].concat(props.classes || []).join(' ');
  const onClick = (e: React.MouseEvent) => {
    if (props.onClick) {
      e.preventDefault();
      props.onClick();
    }
  };
  return (
    <button onClick={onClick} title={props.title} className={className} style={props.style} ref={ref}>
      <img src={props.image} alt={props.title} />
    </button>
  );
});

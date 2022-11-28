import AppBar from '@mui/material/AppBar';
import ToolBar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import React, { useState } from 'react';
import Tasks from './Tasks';
// import Tags from './Tags';
import { supabase } from '../supabase/client';
import { Session } from '@supabase/supabase-js';
import { IconButton, ListItemIcon, ListItemText, MenuList } from '@mui/material';
import { Delete, Logout, Settings } from '@mui/icons-material';

type Props = {
  setSession: (session: Session | null) => void;
};

// const options = [
//   'タスク',
//   'タグ'
// ];

// const views = [
//   <Tasks />,
//   <Tags />
// ];

export default function Home(props: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openId, setOpenId] = useState(-1);

  const handleClick = (id: number) => {
    return (event: React.MouseEvent<HTMLElement>) => {
      setOpenId(id);
      setAnchorEl(event.currentTarget);
    };
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLElement>,
    index: number,
  ) => {
    setSelectedIndex(index);
    setOpenId(-1);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setOpenId(-1);
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    if (await supabase.auth.signOut()) {
      globalThis.localStorage.removeItem(`sb-${new URL(process.env.REACT_APP_SUPABASE_URL!).hostname.split('.')[0]}-auth-token`);
      props.setSession(null);
    }
  };

  const handleDeleteAccount = async () => {
    const {error} = await supabase.functions.invoke('deleteUser');
    if (error) {
      alert(error.message);
    } else {
      await handleSignOut();
    }
  };

  return (
    <div>
      <AppBar position='static'>
        <ToolBar>
          <Typography variant='h6'>
            タスク
          </Typography>
          {/* <Button
            id='menu-button'
            aria-controls={openId===0 ? 'menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openId===0 ? 'true' : undefined}
            onClick={handleClick(0)}
            variant='text'
            size='large'
            sx={{ color: 'white' }}
            endIcon={<ArrowDropDownIcon />}
          >
            <Typography variant='h6'>
              {options[selectedIndex]}
            </Typography>
          </Button>
          <Menu
            id='menu'
            anchorEl={anchorEl}
            open={openId===0}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'menu-button',
            }}
          >
            {options.map((option, index) => (
              <MenuItem
                key={option}
                selected={index === selectedIndex}
                onClick={(event) => handleMenuItemClick(event, index)}
              >
                {option}
              </MenuItem>
            ))}
          </Menu> */}
          <div style={{ flexGrow: 1 }}></div>
          <IconButton
            id='settings-button'
            aria-controls={openId===1 ? 'settings' : undefined}
            aria-haspopup="true"
            aria-expanded={openId===1 ? 'true' : undefined}
            onClick={handleClick(1)}
            size='large'
            sx={{
              color: 'white'
            }}
          >
            <Settings />
          </IconButton>
          <Menu
            id='settings'
            anchorEl={anchorEl}
            open={openId===1}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'settings-button',
            }}
          >
            <MenuList>
              <MenuItem onClick={handleSignOut}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText>
                  サインアウト
                </ListItemText>
              </MenuItem>
              <MenuItem onClick={handleDeleteAccount}>
                <ListItemIcon>
                  <Delete />
                </ListItemIcon>
                <ListItemText>
                  アカウント削除
                </ListItemText>
              </MenuItem>
            </MenuList>
          </Menu>
        </ToolBar>
      </AppBar>
      {/* {views[selectedIndex]} */}
      <Tasks/>
    </div>
  )
}
export interface SettingsTable {
  key: string;
  value: string;
}

export interface Settings {
  site_title: string;
  site_subtitle: string;
  site_description: string;
  author_name: string;
  admin_username: string;
  admin_password_hash: string;
  posts_per_page: string;
  [key: string]: string;
}

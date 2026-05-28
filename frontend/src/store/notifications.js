// store/notifications.js — Zustand notification store
import { create } from 'zustand'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isDrawerOpen: false,

  setNotifications: (notifications) => {
    const unread = notifications.filter(n => !n.isRead).length
    set({ notifications, unreadCount: unread })
  },

  addNotification: (notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    }))
  },

  markRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    }))
  },

  removeNotification: (id) => {
    set(state => {
      const removed = state.notifications.find(n => n._id === id)
      return {
        notifications: state.notifications.filter(n => n._id !== id),
        unreadCount: removed && !removed.isRead
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      }
    })
  },

  toggleDrawer: () => set(state => ({ isDrawerOpen: !state.isDrawerOpen })),
  closeDrawer:  () => set({ isDrawerOpen: false }),
  openDrawer:   () => set({ isDrawerOpen: true }),
}))

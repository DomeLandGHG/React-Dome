import streamlit as st
import firebase_admin
from firebase_admin import credentials, db
import pandas as pd
from datetime import datetime
import base64
import os
import discord
from discord.ext import commands
import asyncio
import threading

# Page Config - MUST be first Streamlit command
st.set_page_config(
    page_title="Money Clicker Admin",
    page_icon="🎮",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Discord Bot Configuration
DISCORD_BOT_TOKEN = 'MTQ0NjYzMzYwMzQ1ODE0MjQwOA.GvKEsV.xxVQ5_GrMsYFrhkLjdh9J0HKIibPeS2MWnWp1c'
DISCORD_BOT_ENABLED = False  # Set to True to enable bot

# Global bot instance
discord_bot = None
bot_thread = None

# Custom CSS for dark gaming theme
st.markdown("""
<style>
    /* Main background */
    .stApp {
        background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%);
    }
    
    /* Headers */
    h1, h2, h3 {
        color: #00f5ff !important;
        text-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
        font-weight: 800;
    }
    
    /* Metrics */
    [data-testid="stMetricValue"] {
        font-size: 32px;
        color: #00f5ff;
        text-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
    }
    
    /* Buttons */
    .stButton>button {
        background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
        color: white;
        border: 2px solid #ff006e;
        border-radius: 10px;
        padding: 10px 24px;
        font-weight: bold;
        transition: all 0.3s;
        box-shadow: 0 4px 15px rgba(255, 0, 110, 0.4);
    }
    
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 0, 110, 0.6);
        border-color: #00f5ff;
    }
    
    /* Tabs */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background-color: rgba(0, 0, 0, 0.3);
        padding: 10px;
        border-radius: 10px;
    }
    
    .stTabs [data-baseweb="tab"] {
        background: linear-gradient(135deg, #1a1f3a 0%, #2a2f4a 100%);
        border-radius: 8px;
        color: #00f5ff;
        font-weight: bold;
        border: 2px solid transparent;
        padding: 10px 20px;
    }
    
    .stTabs [aria-selected="true"] {
        background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
        border-color: #00f5ff;
        box-shadow: 0 0 20px rgba(255, 0, 110, 0.6);
    }
    
    /* Selectbox */
    .stSelectbox [data-baseweb="select"] {
        background-color: rgba(0, 245, 255, 0.1);
        border: 2px solid #00f5ff;
        border-radius: 10px;
    }
    
    /* Dataframe */
    .stDataFrame {
        border: 2px solid #00f5ff;
        border-radius: 10px;
        box-shadow: 0 0 20px rgba(0, 245, 255, 0.3);
    }
    
    /* Sidebar */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0f1419 0%, #1a1f3a 100%);
        border-right: 2px solid #00f5ff;
    }
    
    /* Success/Error messages */
    .stSuccess {
        background-color: rgba(0, 255, 136, 0.1);
        border: 2px solid #00ff88;
        border-radius: 10px;
        box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
    }
    
    .stError {
        background-color: rgba(255, 0, 110, 0.1);
        border: 2px solid #ff006e;
        border-radius: 10px;
        box-shadow: 0 0 15px rgba(255, 0, 110, 0.3);
    }
    
    /* Input fields */
    input {
        background-color: rgba(0, 245, 255, 0.05) !important;
        border: 2px solid #00f5ff !important;
        border-radius: 8px !important;
        color: white !important;
    }
    
    /* Columns */
    [data-testid="column"] {
        background: rgba(0, 245, 255, 0.05);
        border-radius: 10px;
        padding: 15px;
        border: 1px solid rgba(0, 245, 255, 0.2);
    }
</style>
""", unsafe_allow_html=True)

# Firebase Configuration
FIREBASE_CONFIG = {
    "apiKey": "AIzaSyD2YHUerAgPvjNWtPpuvoNnNJvLmNK-_8I",
    "authDomain": "money-clicker-8ee62.firebaseapp.com",
    "databaseURL": "https://money-clicker-8ee62-default-rtdb.europe-west1.firebasedatabase.app",
    "projectId": "money-clicker-8ee62",
    "storageBucket": "money-clicker-8ee62.firebasestorage.app",
    "messagingSenderId": "1019362581052",
    "appId": "1:1019362581052:web:d6e579c1308c1da66ac139"
}

# Initialize Firebase Admin (only once)
if not firebase_admin._apps:
    # Load service account key from JSON file
    key_path = os.path.join(os.path.dirname(__file__), 'firebase-admin-key.json')
    
    if not os.path.exists(key_path):
        st.error(f"❌ Firebase Admin Key not found at: {key_path}")
        st.info("""
        **Setup Instructions:**
        1. Go to Firebase Console: https://console.firebase.google.com/
        2. Select your project: money-clicker-8ee62
        3. Go to Project Settings ⚙️ → Service Accounts
        4. Click "Generate new private key"
        5. Save the downloaded JSON file as: `Streamlit/firebase-admin-key.json`
        """)
        st.stop()
    
    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred, {
        'databaseURL': FIREBASE_CONFIG["databaseURL"]
    })

# Dev Account Credentials
DEV_USERNAME = "Dome"
DEV_LOGIN_CODE = "dXNlcl8xNzY0OTYzMTU2NzYwX2g0M3hhNm94Mw=="  # Replace with your actual login code

# Session State
if 'logged_in' not in st.session_state:
    st.session_state.logged_in = False
if 'current_user' not in st.session_state:
    st.session_state.current_user = None

# Helper Functions
def decode_login_code(code):
    """Decode base64 login code to user ID"""
    try:
        return base64.b64decode(code).decode('utf-8')
    except:
        return None

def get_all_players():
    """Get all players from Firebase"""
    ref = db.reference('users')
    return ref.get() or {}

def get_player_data(user_id):
    """Get complete player data"""
    game_data_ref = db.reference(f'gameData/{user_id}')
    leaderboard_ref = db.reference(f'leaderboard/{user_id}')
    
    game_data = game_data_ref.get()
    leaderboard_data = leaderboard_ref.get()
    
    return {
        'game_data': game_data,
        'leaderboard': leaderboard_data
    }

def get_leaderboard_data():
    """Get all leaderboard entries"""
    ref = db.reference('leaderboard')
    data = ref.get() or {}
    
    # Convert to list and add user_id
    leaderboard_list = []
    for user_id, entry in data.items():
        entry['userId'] = user_id
        leaderboard_list.append(entry)
    
    return leaderboard_list

def delete_player(user_id):
    """Delete player from all database locations"""
    db.reference(f'users/{user_id}').delete()
    db.reference(f'gameData/{user_id}').delete()
    db.reference(f'leaderboard/{user_id}').delete()
    db.reference(f'usernames/{user_id}').delete()

def update_player_data(user_id, field_path, value):
    """Update a specific field in player's game data"""
    ref = db.reference(f'gameData/{user_id}/{field_path}')
    ref.set(value)
    return True

def update_nested_field(user_id, path, value):
    """Update nested fields like stats/allTimeMoneyEarned"""
    ref = db.reference(f'gameData/{user_id}/{path}')
    ref.set(value)
    return True

def ban_player_from_leaderboard(user_id, ban=True):
    """Ban or unban a player from leaderboards"""
    ref = db.reference(f'leaderboardBans/{user_id}')
    ref.set(ban)
    return True

def is_player_banned(user_id):
    """Check if player is banned from leaderboards"""
    ref = db.reference(f'leaderboardBans/{user_id}')
    snapshot = ref.get()
    return snapshot == True if snapshot else False

def bulk_edit_players(player_ids, field_path, value):
    """Edit multiple players at once"""
    for user_id in player_ids:
        update_player_data(user_id, field_path, value)
    return True

def get_player_ranks(user_id, leaderboard_data):
    """Calculate player's rank in all categories"""
    categories = ['allTimeMoney', 'totalTiers', 'moneyPerClick', 'onlineTime', 'totalClicks', 'totalGems']
    ranks = {}
    
    for category in categories:
        sorted_data = sorted(leaderboard_data, key=lambda x: x.get(category, 0), reverse=True)
        rank = next((i+1 for i, player in enumerate(sorted_data) if player['userId'] == user_id), None)
        ranks[category] = rank
    
    return ranks

# Login Page
def login_page():
    # Center the login form
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("<h1 style='text-align: center; font-size: 48px;'>🎮</h1>", unsafe_allow_html=True)
        st.markdown("<h1 style='text-align: center;'>MONEY CLICKER</h1>", unsafe_allow_html=True)
        st.markdown("<h3 style='text-align: center; color: #8338ec;'>Admin Dashboard</h3>", unsafe_allow_html=True)
        st.markdown("<br>", unsafe_allow_html=True)
        
        with st.form("login_form"):
            st.markdown("### 🔐 Admin Login")
            username = st.text_input("👤 Username", placeholder="Enter your username")
            login_code = st.text_input("🔑 Login Code", type="password", placeholder="Enter your login code")
            
            col_a, col_b, col_c = st.columns([1, 2, 1])
            with col_b:
                submit = st.form_submit_button("🚀 LOGIN", use_container_width=True)
            
            if submit:
                if username == DEV_USERNAME and login_code == DEV_LOGIN_CODE:
                    st.session_state.logged_in = True
                    st.session_state.current_user = username
                    st.success("✅ Login successful! Redirecting...")
                    st.rerun()
                else:
                    st.error("❌ Invalid credentials! Please try again.")

# Main Dashboard
def main_dashboard():
    # Sidebar
    with st.sidebar:
        st.markdown(f"### 👤 {st.session_state.current_user}")
        st.markdown("---")
        
        # Quick Stats
        st.markdown("### 📊 Quick Stats")
        try:
            players = get_all_players()
            leaderboard_data = get_leaderboard_data()
            
            st.metric("Total Players", len(players), delta=None)
            st.metric("Leaderboard Entries", len(leaderboard_data), delta=None)
            
            # Top player
            if leaderboard_data:
                top_player = max(leaderboard_data, key=lambda x: x.get('allTimeMoney', 0))
                st.markdown(f"**🏆 Top Player:**")
                st.markdown(f"_{top_player.get('username', 'Unknown')}_")
                st.markdown(f"💰 {top_player.get('allTimeMoney', 0):,}")
        except:
            pass
        
        st.markdown("---")
        if st.button("🚪 LOGOUT", use_container_width=True):
            st.session_state.logged_in = False
            st.session_state.current_user = None
            st.rerun()
    
    # Main Content
    st.markdown("<h1 style='text-align: center;'>🎮 ADMIN CONTROL CENTER</h1>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: #8338ec; font-size: 18px;'>Manage your Money Clicker universe</p>", unsafe_allow_html=True)
    st.markdown("---")
    
    # Tabs with custom styling
    tab1, tab2, tab3, tab4, tab5 = st.tabs(["🏆 LEADERBOARDS", "👥 PLAYERS", "🔍 PLAYER DETAILS", "⚡ BULK ACTIONS", "🤖 DISCORD BOT"])
    
    # Tab 1: Leaderboards
    with tab1:
        col1, col2, col3 = st.columns([2, 1, 1])
        
        with col1:
            st.markdown("### 📊 Leaderboard Rankings")
        
        with col2:
            category = st.selectbox(
                "Category",
                ["allTimeMoney", "totalTiers", "moneyPerClick", "onlineTime", "totalClicks", "totalGems"],
                format_func=lambda x: {
                    "allTimeMoney": "💰 All Time Money",
                    "totalTiers": "🏆 Total Tiers",
                    "moneyPerClick": "👆 Money Per Click",
                    "onlineTime": "⏰ Online Time",
                    "totalClicks": "🖱️ Total Clicks",
                    "totalGems": "💎 Total Gems"
                }[x]
            )
        
        with col3:
            show_banned = st.checkbox("Show Banned", value=False)
        
        leaderboard_data = get_leaderboard_data()
        sorted_data = sorted(leaderboard_data, key=lambda x: x.get(category, 0), reverse=True)
        
        # Filter banned if needed
        if not show_banned:
            sorted_data = [p for p in sorted_data if not is_player_banned(p['userId'])]
        
        st.markdown("---")
        
        # Display leaderboard with enhanced styling
        for i, player in enumerate(sorted_data[:100], 1):
            is_banned = is_player_banned(player['userId'])
            
            # Rank colors
            if i == 1:
                rank_color = "#FFD700"  # Gold
                medal = "🥇"
            elif i == 2:
                rank_color = "#C0C0C0"  # Silver
                medal = "🥈"
            elif i == 3:
                rank_color = "#CD7F32"  # Bronze
                medal = "🥉"
            else:
                rank_color = "#00f5ff"
                medal = f"#{i}"
            
            # Create container for each entry
            container = st.container()
            with container:
                col1, col2, col3, col4, col5 = st.columns([0.5, 2, 2, 1, 1])
                
                with col1:
                    st.markdown(f"<h3 style='color: {rank_color}; text-align: center;'>{medal}</h3>", unsafe_allow_html=True)
                
                with col2:
                    status = "🚫 " if is_banned else ""
                    st.markdown(f"**{status}{player.get('username', 'Unknown')}**")
                
                with col3:
                    value = player.get(category, 0)
                    if category == 'onlineTime':
                        hours = int(value // 3600)
                        minutes = int((value % 3600) // 60)
                        st.markdown(f"⏰ **{hours}h {minutes}m**")
                    else:
                        st.markdown(f"💫 **{value:,}**")
                
                with col4:
                    if is_banned:
                        if st.button(f"✅ Unban", key=f"unban_{player['userId']}_{category}"):
                            ban_player_from_leaderboard(player['userId'], False)
                            st.success(f"Unbanned {player.get('username', 'player')}")
                            st.rerun()
                    else:
                        if st.button(f"🚫 Ban", key=f"ban_{player['userId']}_{category}"):
                            ban_player_from_leaderboard(player['userId'], True)
                            st.warning(f"Banned {player.get('username', 'player')}")
                            st.rerun()
                
                with col5:
                    if st.button(f"🗑️", key=f"del_{player['userId']}_{category}", help="Delete player"):
                        delete_player(player['userId'])
                        st.success(f"Deleted {player.get('username', 'player')}")
                        st.rerun()
                
                st.markdown("---")
    
    # Tab 2: Players List
    with tab2:
        st.markdown("### 👥 All Registered Players")
        
        players = get_all_players()
        
        # Search bar
        search = st.text_input("🔍 Search by username", placeholder="Type to search...")
        
        # Create DataFrame
        player_list = []
        for user_id, player_info in players.items():
            username = player_info.get('username', 'Unknown')
            if search.lower() in username.lower() or not search:
                player_list.append({
                    '👤 Username': username,
                    '🆔 User ID': user_id[:20] + "...",
                    '📅 Created': datetime.fromtimestamp(player_info.get('createdAt', 0) / 1000).strftime('%Y-%m-%d %H:%M')
                })
        
        df = pd.DataFrame(player_list)
        st.dataframe(df, use_container_width=True, height=600)
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("📊 Total Players", len(players))
        with col2:
            st.metric("🔍 Filtered Results", len(player_list))
        with col3:
            if search:
                st.metric("🎯 Search Active", "YES")
    
    # Tab 3: Player Details
    with tab3:
        st.markdown("### 🔍 Detailed Player Information")
        
        players = get_all_players()
        player_options = {f"{info.get('username', 'Unknown')} ({user_id[:15]}...)": user_id 
                         for user_id, info in players.items()}
        
        selected_player = st.selectbox("Select a player to view details", list(player_options.keys()))
        
        if selected_player:
            user_id = player_options[selected_player]
            player_data = get_player_data(user_id)
            leaderboard_data = get_leaderboard_data()
            ranks = get_player_ranks(user_id, leaderboard_data)
            
            game_data = player_data['game_data']
            
            if game_data:
                # Header with player name
                st.markdown(f"<h2 style='text-align: center;'>👤 {game_data.get('username', 'N/A')}</h2>", unsafe_allow_html=True)
                st.markdown(f"<p style='text-align: center; color: #8338ec;'>{user_id}</p>", unsafe_allow_html=True)
                st.markdown("---")
                
                # Edit Mode Toggle
                edit_mode = st.checkbox("✏️ EDIT MODE", key="edit_mode")
                
                if edit_mode:
                    st.warning("⚠️ Edit mode active - Changes will be saved immediately!")
                
                st.markdown("---")
                
                # Main Stats - Editable
                st.markdown("### 💰 Main Resources")
                col1, col2, col3, col4 = st.columns(4)
                
                with col1:
                    if edit_mode:
                        new_money = st.number_input("💰 Money", value=int(game_data.get('money', 0)), step=1000, key="edit_money")
                        if st.button("Save Money", key="save_money"):
                            update_player_data(user_id, 'money', new_money)
                            st.success("✅ Money updated!")
                            st.rerun()
                    else:
                        st.metric("💰 Money", f"{game_data.get('money', 0):,}")
                
                with col2:
                    if edit_mode:
                        new_rp = st.number_input("🔄 Rebirth Points", value=int(game_data.get('rebirthPoints', 0)), step=1, key="edit_rp")
                        if st.button("Save RP", key="save_rp"):
                            update_player_data(user_id, 'rebirthPoints', new_rp)
                            st.success("✅ Rebirth Points updated!")
                            st.rerun()
                    else:
                        st.metric("🔄 Rebirth Points", f"{game_data.get('rebirthPoints', 0):,}")
                
                with col3:
                    if edit_mode:
                        new_gems = st.number_input("💎 Gems", value=int(game_data.get('gems', 0)), step=1, key="edit_gems")
                        if st.button("Save Gems", key="save_gems"):
                            update_player_data(user_id, 'gems', new_gems)
                            st.success("✅ Gems updated!")
                            st.rerun()
                    else:
                        st.metric("💎 Gems", f"{game_data.get('gems', 0):,}")
                
                with col4:
                    if edit_mode:
                        new_clicks = st.number_input("🖱️ Total Clicks", value=int(game_data.get('clicksTotal', 0)), step=100, key="edit_clicks")
                        if st.button("Save Clicks", key="save_clicks"):
                            update_player_data(user_id, 'clicksTotal', new_clicks)
                            st.success("✅ Clicks updated!")
                            st.rerun()
                    else:
                        st.metric("🖱️ Total Clicks", f"{game_data.get('clicksTotal', 0):,}")
                
                st.markdown("---")
                
                # Username and Money Per Click
                st.markdown("### ⚙️ Player Settings")
                col1, col2 = st.columns(2)
                
                with col1:
                    if edit_mode:
                        new_username = st.text_input("👤 Username", value=game_data.get('username', ''), key="edit_username")
                        if st.button("Save Username", key="save_username"):
                            update_player_data(user_id, 'username', new_username)
                            # Also update in users and usernames
                            db.reference(f'users/{user_id}/username').set(new_username)
                            db.reference(f'usernames/{user_id}/username').set(new_username)
                            st.success("✅ Username updated!")
                            st.rerun()
                    else:
                        st.metric("👤 Username", game_data.get('username', 'N/A'))
                
                with col2:
                    if edit_mode:
                        new_mpc = st.number_input("👆 Money Per Click", value=float(game_data.get('moneyPerClick', 0)), step=0.1, format="%.2f", key="edit_mpc")
                        if st.button("Save MPC", key="save_mpc"):
                            update_player_data(user_id, 'moneyPerClick', new_mpc)
                            st.success("✅ Money Per Click updated!")
                            st.rerun()
                    else:
                        st.metric("👆 Money Per Click", f"{game_data.get('moneyPerClick', 0):,}")
                
                st.markdown("---")
                
                # Statistics - Editable
                if 'stats' in game_data:
                    st.markdown("### 📊 Statistics (Editable)")
                    stats = game_data['stats']
                    
                    stat_col1, stat_col2, stat_col3 = st.columns(3)
                    
                    with stat_col1:
                        if edit_mode:
                            new_all_time_money = st.number_input("💸 All Time Money", value=int(stats.get('allTimeMoneyEarned', 0)), step=1000, key="edit_atm")
                            if st.button("Save ATM", key="save_atm"):
                                update_nested_field(user_id, 'stats/allTimeMoneyEarned', new_all_time_money)
                                st.success("✅ All Time Money updated!")
                                st.rerun()
                            
                            new_total_rebirths = st.number_input("🔄 Total Rebirths", value=int(stats.get('totalRebirths', 0)), step=1, key="edit_tr")
                            if st.button("Save Rebirths", key="save_tr"):
                                update_nested_field(user_id, 'stats/totalRebirths', new_total_rebirths)
                                st.success("✅ Total Rebirths updated!")
                                st.rerun()
                        else:
                            st.metric("💸 All Time Money", f"{stats.get('allTimeMoneyEarned', 0):,}")
                            st.metric("🔄 Total Rebirths", stats.get('totalRebirths', 0))
                    
                    with stat_col2:
                        if edit_mode:
                            new_all_time_gems = st.number_input("💎 All Time Gems", value=int(stats.get('allTimeGemsEarned', 0)), step=1, key="edit_atg")
                            if st.button("Save ATG", key="save_atg"):
                                update_nested_field(user_id, 'stats/allTimeGemsEarned', new_all_time_gems)
                                st.success("✅ All Time Gems updated!")
                                st.rerun()
                            
                            online_time = stats.get('onlineTime', 0)
                            hours = int(online_time // 3600)
                            new_online_time = st.number_input("⏰ Online Time (seconds)", value=int(online_time), step=60, key="edit_ot")
                            if st.button("Save Online Time", key="save_ot"):
                                update_nested_field(user_id, 'stats/onlineTime', new_online_time)
                                st.success("✅ Online Time updated!")
                                st.rerun()
                        else:
                            st.metric("💎 All Time Gems", stats.get('allTimeGemsEarned', 0))
                            online_time = stats.get('onlineTime', 0)
                            hours = int(online_time // 3600)
                            minutes = int((online_time % 3600) // 60)
                            st.metric("⏰ Online Time", f"{hours}h {minutes}m")
                    
                    with stat_col3:
                        if edit_mode:
                            click_eff = game_data.get('money', 0) / max(game_data.get('clicksTotal', 1), 1)
                            st.metric("📈 Click Efficiency", f"{click_eff:.2f}")
                            st.caption("(Auto-calculated)")
                        else:
                            st.metric("📈 Click Efficiency", f"{game_data.get('money', 0) / max(game_data.get('clicksTotal', 1), 1):.2f}")
                
                st.markdown("---")
                
                # Leaderboard Rankings (Read-only)
                st.markdown("### 🏆 Leaderboard Rankings")
                rank_col1, rank_col2, rank_col3 = st.columns(3)
                
                rank_items = list(ranks.items())
                for i, (category, rank) in enumerate(rank_items):
                    col = [rank_col1, rank_col2, rank_col3][i % 3]
                    with col:
                        icon = {
                            'allTimeMoney': '💰',
                            'totalTiers': '🏆',
                            'moneyPerClick': '👆',
                            'onlineTime': '⏰',
                            'totalClicks': '🖱️',
                            'totalGems': '💎'
                        }.get(category, '📊')
                        
                        if rank and rank <= 3:
                            medal = ['🥇', '🥈', '🥉'][rank - 1]
                            st.metric(f"{icon} {category}", f"{medal} #{rank}")
                        elif rank:
                            st.metric(f"{icon} {category}", f"#{rank}")
                        else:
                            st.metric(f"{icon} {category}", "Not ranked")
                
                st.markdown("---")
                
                # Danger Zone
                st.markdown("### ⚠️ Danger Zone")
                
                danger_col1, danger_col2 = st.columns(2)
                
                with danger_col1:
                    is_banned = is_player_banned(user_id)
                    if is_banned:
                        if st.button(f"✅ UNBAN FROM LEADERBOARDS", use_container_width=True):
                            ban_player_from_leaderboard(user_id, False)
                            st.success(f"✅ Player unbanned from leaderboards!")
                            st.rerun()
                    else:
                        if st.button(f"🚫 BAN FROM LEADERBOARDS", use_container_width=True):
                            ban_player_from_leaderboard(user_id, True)
                            st.warning(f"⚠️ Player banned from leaderboards!")
                            st.rerun()
                
                with danger_col2:
                    if st.button(f"🗑️ DELETE PLAYER: {game_data.get('username', 'Unknown')}", use_container_width=True, type="primary"):
                        delete_player(user_id)
                        st.success(f"✅ Player {game_data.get('username', 'Unknown')} has been permanently deleted!")
                        st.balloons()
                        st.rerun()
    
    # Tab 4: Bulk Actions
    with tab4:
        st.markdown("### ⚡ Bulk Actions - Edit Multiple Players")
        st.warning("⚠️ Use with caution! These actions affect multiple players at once.")
        
        players = get_all_players()
        
        # Multi-select players
        st.markdown("#### 1️⃣ Select Players")
        player_selection = {}
        for user_id, info in players.items():
            player_selection[f"{info.get('username', 'Unknown')} ({user_id[:15]}...)"] = user_id
        
        selected_players = st.multiselect(
            "Choose players to edit",
            options=list(player_selection.keys()),
            help="Select one or more players"
        )
        
        if selected_players:
            st.success(f"✅ {len(selected_players)} player(s) selected")
            
            st.markdown("#### 2️⃣ Choose Action")
            
            col1, col2 = st.columns(2)
            
            with col1:
                bulk_action = st.selectbox(
                    "Select what to modify",
                    ["Add Money", "Add Gems", "Add Rebirth Points", "Add Clicks", "Reset Money", "Reset All Stats", "Ban All", "Unban All", "Delete All"]
                )
            
            with col2:
                if bulk_action in ["Add Money", "Add Gems", "Add Rebirth Points", "Add Clicks"]:
                    bulk_value = st.number_input(f"Amount to add", min_value=0, value=1000, step=100)
            
            st.markdown("#### 3️⃣ Execute")
            
            if st.button(f"🚀 EXECUTE: {bulk_action}", type="primary", use_container_width=True):
                selected_ids = [player_selection[p] for p in selected_players]
                
                try:
                    if bulk_action == "Add Money":
                        for user_id in selected_ids:
                            player_data = get_player_data(user_id)
                            current_money = player_data['game_data'].get('money', 0)
                            update_player_data(user_id, 'money', current_money + bulk_value)
                        st.success(f"✅ Added {bulk_value:,} money to {len(selected_ids)} players!")
                    
                    elif bulk_action == "Add Gems":
                        for user_id in selected_ids:
                            player_data = get_player_data(user_id)
                            current_gems = player_data['game_data'].get('gems', 0)
                            update_player_data(user_id, 'gems', current_gems + bulk_value)
                        st.success(f"✅ Added {bulk_value:,} gems to {len(selected_ids)} players!")
                    
                    elif bulk_action == "Add Rebirth Points":
                        for user_id in selected_ids:
                            player_data = get_player_data(user_id)
                            current_rp = player_data['game_data'].get('rebirthPoints', 0)
                            update_player_data(user_id, 'rebirthPoints', current_rp + bulk_value)
                        st.success(f"✅ Added {bulk_value:,} rebirth points to {len(selected_ids)} players!")
                    
                    elif bulk_action == "Add Clicks":
                        for user_id in selected_ids:
                            player_data = get_player_data(user_id)
                            current_clicks = player_data['game_data'].get('clicksTotal', 0)
                            update_player_data(user_id, 'clicksTotal', current_clicks + bulk_value)
                        st.success(f"✅ Added {bulk_value:,} clicks to {len(selected_ids)} players!")
                    
                    elif bulk_action == "Reset Money":
                        for user_id in selected_ids:
                            update_player_data(user_id, 'money', 0)
                        st.success(f"✅ Reset money for {len(selected_ids)} players!")
                    
                    elif bulk_action == "Reset All Stats":
                        for user_id in selected_ids:
                            update_player_data(user_id, 'money', 0)
                            update_player_data(user_id, 'gems', 0)
                            update_player_data(user_id, 'rebirthPoints', 0)
                            update_player_data(user_id, 'clicksTotal', 0)
                        st.success(f"✅ Reset all stats for {len(selected_ids)} players!")
                    
                    elif bulk_action == "Ban All":
                        for user_id in selected_ids:
                            ban_player_from_leaderboard(user_id, True)
                        st.warning(f"⚠️ Banned {len(selected_ids)} players from leaderboards!")
                    
                    elif bulk_action == "Unban All":
                        for user_id in selected_ids:
                            ban_player_from_leaderboard(user_id, False)
                        st.success(f"✅ Unbanned {len(selected_ids)} players from leaderboards!")
                    
                    elif bulk_action == "Delete All":
                        for user_id in selected_ids:
                            delete_player(user_id)
                        st.success(f"✅ Deleted {len(selected_ids)} players permanently!")
                        st.balloons()
                    
                    st.rerun()
                    
                except Exception as e:
                    st.error(f"❌ Error: {str(e)}")
        else:
            st.info("👆 Select at least one player to perform bulk actions")
    
    # Tab 5: Discord Integration
    with tab5:
        st.markdown("### 🤖 Discord Bot Control")
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            st.markdown("#### Bot Status")
            
            # Check if bot is running (simple check via session state)
            bot_running = st.session_state.get('discord_bot_running', False)
            
            if bot_running:
                st.success("✅ Discord Bot is ONLINE")
                st.info("🔗 Bot is running in a separate terminal")
                st.markdown("""
                **Active Features:**
                - 🔗 Account Linking System
                - 📊 Leaderboard Commands
                - 👑 Admin Commands
                - 💎 Auto-rewards (100 gems for linking)
                """)
            else:
                st.warning("⚠️ Discord Bot is OFFLINE")
                st.info("💡 Start the bot manually: `py -3.11 Streamlit/discord_bot.py`")
        
        with col2:
            st.markdown("#### Quick Actions")
            
            if st.button("📝 View Bot Commands", use_container_width=True):
                st.session_state['show_bot_commands'] = True
            
            if st.button("🔗 View Linked Accounts", use_container_width=True):
                st.session_state['show_linked_accounts'] = True
        
        # Show bot commands
        if st.session_state.get('show_bot_commands', False):
            st.markdown("---")
            st.markdown("### 📋 Available Bot Commands")
            
            commands_col1, commands_col2 = st.columns(2)
            
            with commands_col1:
                st.markdown("""
                **🎮 Player Commands:**
                - `!link <login-code>` - Link game account (+100 gems)
                - `!me` - Show own stats (requires linked account)
                - `!leaderboard [category]` - Top 10 rankings
                - `!player <username>` - View player stats
                - `!stats` - Global game statistics
                
                **Categories:** money, gems, tier, mpc, time, clicks
                """)
            
            with commands_col2:
                st.markdown("""
                **👑 Admin Commands:**
                - `!givemoney <user> <amount>` - Give money
                - `!givegems <user> <amount>` - Give gems
                - `!ban <username>` - Ban from leaderboards
                - `!unban <username>` - Unban player
                - `!unlink @user` - Unlink Discord account
                - `!announce <message>` - Post announcement
                """)
            
            if st.button("❌ Close Commands"):
                st.session_state['show_bot_commands'] = False
                st.rerun()
        
        # Show linked accounts
        if st.session_state.get('show_linked_accounts', False):
            st.markdown("---")
            st.markdown("### 🔗 Discord-Game Account Links")
            
            # Get all linked accounts from Firebase
            links_ref = db.reference('discord_links')
            linked_accounts = links_ref.get() or {}
            
            if linked_accounts:
                links_data = []
                for discord_id, link_info in linked_accounts.items():
                    game_user_id = link_info.get('game_user_id')
                    linked_at = link_info.get('linked_at', 'Unknown')
                    
                    # Get game data - try both paths
                    try:
                        # First try users path (for linked accounts)
                        user_ref = db.reference(f'users/{game_user_id}')
                        user_data = user_ref.get()
                        if user_data and 'game_data' in user_data:
                            game_data = user_data['game_data']
                        else:
                            # Fallback to gameData path
                            game_data = db.reference(f'gameData/{game_user_id}').get() or {}
                    except:
                        game_data = {}
                    
                    username = game_data.get('username', 'Unknown')
                    
                    links_data.append({
                        'Discord ID': discord_id,
                        'Game Username': username,
                        'Game User ID': game_user_id[:20] + '...',
                        'Linked At': linked_at[:19] if len(linked_at) > 19 else linked_at,
                        'Money': f"{game_data.get('money', 0):,.0f}",
                        'Gems': game_data.get('gems', 0)
                    })
                
                df = pd.DataFrame(links_data)
                st.dataframe(df, use_container_width=True, height=400)
                st.success(f"📊 Total Linked Accounts: {len(links_data)}")
            else:
                st.info("📭 No accounts linked yet. Users can link with `!link <login-code>` in Discord!")
            
            if st.button("❌ Close Linked Accounts"):
                st.session_state['show_linked_accounts'] = False
                st.rerun()
        
        # Discord Announcements Section
        st.markdown("---")
        st.markdown("### 📢 Send Discord Announcement")
        
        announcement_col1, announcement_col2 = st.columns([3, 1])
        
        with announcement_col1:
            announcement_text = st.text_area(
                "Announcement Message",
                placeholder="Enter your announcement here...",
                help="This will be posted in your Discord server"
            )
        
        with announcement_col2:
            st.markdown("<br>", unsafe_allow_html=True)
            if st.button("📣 Send to Discord", type="primary", use_container_width=True):
                if announcement_text:
                    # Save announcement to Firebase for bot to pick up
                    announcement_ref = db.reference('discord_announcements')
                    announcement_ref.push({
                        'message': announcement_text,
                        'created_at': datetime.now().isoformat(),
                        'sent': False
                    })
                    st.success("✅ Announcement queued! Bot will send it shortly.")
                else:
                    st.error("❌ Please enter a message!")
        
        # Linked Account Rewards
        st.markdown("---")
        st.markdown("### 🎁 Discord Rewards")
        
        reward_col1, reward_col2, reward_col3 = st.columns(3)
        
        with reward_col1:
            st.metric("💎 Linking Bonus", "100 Gems", help="Reward for linking Discord account")
        
        with reward_col2:
            linked_count = len(db.reference('discord_links').get() or {})
            st.metric("🔗 Linked Accounts", linked_count)
        
        with reward_col3:
            total_rewards = linked_count * 100
            st.metric("💰 Total Rewards Given", f"{total_rewards} Gems")

# Main App
def main():
    if st.session_state.logged_in:
        main_dashboard()
    else:
        login_page()

if __name__ == "__main__":
    main()
import discord
from discord.ext import commands
import firebase_admin
from firebase_admin import credentials, db
import asyncio
from datetime import datetime
import os
from dotenv import load_dotenv

# Discord Bot Setup
intents = discord.Intents.default()
intents.message_content = True
intents.members = True
intents.presences = True

bot = commands.Bot(command_prefix='!', intents=intents)

# Firebase Setup (reuse existing credentials)
if not firebase_admin._apps:
    cred = credentials.Certificate('Streamlit/firebase-admin-key.json')
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://money-clicker-dome-default-rtdb.europe-west1.firebasedatabase.app/'
    })

# Configuration
LEADERBOARD_CHANNEL_ID = None  # Set this in config
ANNOUNCEMENTS_CHANNEL_ID = None  # Set this in config
ADMIN_ROLE_NAME = "Game Admin"

# Discord to Game Account Linking
LINKED_ACCOUNTS = {}  # Format: {discord_user_id: game_user_id}

# Helper Functions
def format_number(num):
    """Format numbers with commas"""
    if num >= 1e8:
        return f"{num:.2e}"
    return f"{num:,.0f}"

def get_all_players():
    """Get all players from Firebase"""
    ref = db.reference('users')
    users = ref.get()
    if not users:
        return {}
    
    players = {}
    for user_id, user_data in users.items():
        if 'game_data' in user_data:
            players[user_id] = user_data
    return players

def get_leaderboard(category='money', limit=10):
    """Get top players for a category"""
    players = get_all_players()
    
    category_map = {
        'money': 'money',
        'gems': 'gems',
        'tier': 'highestTier',
        'mpc': 'moneyPerClick',
        'time': 'totalTimePlayed',
        'clicks': 'clicksTotal'
    }
    
    field = category_map.get(category, 'money')
    
    leaderboard = []
    for user_id, data in players.items():
        game_data = data.get('game_data', {})
        value = game_data.get(field, 0)
        username = game_data.get('username', 'Unknown')
        
        # Skip banned players
        if db.reference(f'leaderboards/banned/{user_id}').get():
            continue
        
        leaderboard.append({
            'user_id': user_id,
            'username': username,
            'value': value
        })
    
    leaderboard.sort(key=lambda x: x['value'], reverse=True)
    return leaderboard[:limit]

def get_player_by_username(username):
    """Find player by username"""
    players = get_all_players()
    for user_id, data in players.items():
        game_data = data.get('game_data', {})
        if game_data.get('username', '').lower() == username.lower():
            return user_id, data
    return None, None

def get_player_by_login_code(login_code):
    """Find player by login code"""
    players = get_all_players()
    for user_id, data in players.items():
        if data.get('loginCode') == login_code:
            return user_id, data
    return None, None

def get_player_data(user_id):
    """Get player data by user ID"""
    ref = db.reference(f'users/{user_id}')
    return ref.get() or {}

def link_discord_account(discord_id, game_user_id):
    """Link Discord account to game account"""
    LINKED_ACCOUNTS[discord_id] = game_user_id
    # Store in Firebase
    db.reference(f'discord_links/{discord_id}').set({
        'game_user_id': game_user_id,
        'linked_at': datetime.now().isoformat()
    })
    return True

def get_linked_game_account(discord_id):
    """Get linked game account for Discord user"""
    if discord_id in LINKED_ACCOUNTS:
        return LINKED_ACCOUNTS[discord_id]
    
    # Check Firebase
    link_data = db.reference(f'discord_links/{discord_id}').get()
    if link_data:
        game_user_id = link_data.get('game_user_id')
        LINKED_ACCOUNTS[discord_id] = game_user_id
        return game_user_id
    return None

def is_account_linked(discord_id):
    """Check if Discord account is linked"""
    return get_linked_game_account(discord_id) is not None

# Bot Events
@bot.event
async def on_ready():
    print(f'✅ {bot.user} is online!')
    print(f'🎮 Connected to {len(bot.guilds)} server(s)')
    
    # Set bot status
    await bot.change_presence(
        activity=discord.Game(name="Money Clicker | !link to connect")
    )
    
    # Start background task to check for announcements
    bot.loop.create_task(check_announcements())

async def check_announcements():
    """Background task to check for announcements from Streamlit"""
    await bot.wait_until_ready()
    
    while not bot.is_closed():
        try:
            # Check Firebase for pending announcements
            announcements_ref = db.reference('discord_announcements')
            announcements = announcements_ref.get()
            
            if announcements:
                for key, announcement in announcements.items():
                    if not announcement.get('sent', False):
                        message = announcement.get('message', '')
                        
                        # Send to all servers
                        for guild in bot.guilds:
                            # Try to find announcement channel
                            channel = discord.utils.get(guild.text_channels, name='announcements')
                            if not channel:
                                channel = discord.utils.get(guild.text_channels, name='general')
                            
                            if channel:
                                embed = discord.Embed(
                                    title="📢 Admin Announcement",
                                    description=message,
                                    color=discord.Color.gold(),
                                    timestamp=datetime.now()
                                )
                                embed.set_footer(text="Sent from Admin Dashboard")
                                
                                try:
                                    await channel.send(embed=embed)
                                    print(f"📣 Sent announcement to {guild.name}")
                                except Exception as e:
                                    print(f"❌ Failed to send announcement to {guild.name}: {e}")
                        
                        # Mark as sent
                        db.reference(f'discord_announcements/{key}/sent').set(True)
                        db.reference(f'discord_announcements/{key}/sent_at').set(datetime.now().isoformat())
            
            # Check every 5 seconds
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"❌ Error in check_announcements: {e}")
            await asyncio.sleep(10)

@bot.event
async def on_member_join(member):
    """Welcome new members and prompt account linking"""
    # Send welcome message in server
    welcome_channel = discord.utils.get(member.guild.text_channels, name='general')
    if welcome_channel:
        embed = discord.Embed(
            title="🎮 Welcome to Money Clicker!",
            description=f"Hey {member.mention}! Welcome to our server!",
            color=discord.Color.green()
        )
        embed.add_field(name="📨 Check your DMs!", value="I've sent you instructions to link your game account!", inline=False)
        embed.add_field(name="🎁 Rewards", value="Link your account to get **100 FREE GEMS**!", inline=False)
        await welcome_channel.send(embed=embed)
    
    # Send DM with linking instructions
    try:
        dm_embed = discord.Embed(
            title="🔗 Link Your Game Account",
            description="Connect your Money Clicker account to unlock exclusive rewards!",
            color=discord.Color.blue()
        )
        dm_embed.add_field(
            name="📝 How to Link:",
            value=(
                "1️⃣ Open Money Clicker game\n"
                "2️⃣ Find your **Login Code** in the settings\n"
                "3️⃣ Use the command: `!link <your-login-code>`\n\n"
                "**Example:** `!link dXNlcl8xMjM0NTY3ODkwX2FiY2RlZg==`"
            ),
            inline=False
        )
        dm_embed.add_field(
            name="🎁 Benefits:",
            value=(
                "✅ **100 FREE GEMS** for linking!\n"
                "✅ See your own stats anytime with `!me`\n"
                "✅ Get special Discord-only rewards\n"
                "✅ Participate in exclusive events"
            ),
            inline=False
        )
        dm_embed.set_footer(text="Your login code is safe and only used for linking!")
        
        await member.send(embed=dm_embed)
    except discord.Forbidden:
        # User has DMs disabled
        if welcome_channel:
            await welcome_channel.send(
                f"{member.mention} Please enable DMs to link your account! Or use `!link <login-code>` here."
            )

# Account Linking Commands
@bot.command(name='link')
async def link_account(ctx, login_code: str = None):
    """Link your Discord account to your game account - Usage: !link <login-code>"""
    
    if not login_code:
        embed = discord.Embed(
            title="❌ Missing Login Code",
            description="Please provide your login code!",
            color=discord.Color.red()
        )
        embed.add_field(
            name="📝 How to use:",
            value="`!link <your-login-code>`\n\n**Example:** `!link dXNlcl8xMjM0NTY3ODkwX2FiY2RlZg==`",
            inline=False
        )
        embed.add_field(
            name="🔍 Where to find your login code:",
            value="Open Money Clicker → Settings → Copy your Login Code",
            inline=False
        )
        await ctx.send(embed=embed)
        return
    
    # Check if already linked
    if is_account_linked(ctx.author.id):
        current_game_id = get_linked_game_account(ctx.author.id)
        player_data = get_player_data(current_game_id)
        game_data = player_data.get('game_data', {})
        
        embed = discord.Embed(
            title="⚠️ Already Linked",
            description=f"Your Discord account is already linked to **{game_data.get('username', 'Unknown')}**",
            color=discord.Color.orange()
        )
        embed.add_field(name="💡 Want to change?", value="Contact an admin to unlink first.", inline=False)
        await ctx.send(embed=embed)
        return
    
    # Find player by login code
    game_user_id, player_data = get_player_by_login_code(login_code)
    
    if not player_data:
        embed = discord.Embed(
            title="❌ Invalid Login Code",
            description="No account found with this login code!",
            color=discord.Color.red()
        )
        embed.add_field(
            name="🔍 Make sure:",
            value=(
                "✅ You copied the **entire** login code\n"
                "✅ The code is from **Money Clicker** game\n"
                "✅ You're using the **current** code (not an old one)"
            ),
            inline=False
        )
        await ctx.send(embed=embed)
        return
    
    game_data = player_data.get('game_data', {})
    username = game_data.get('username', 'Unknown')
    
    # Link the accounts
    link_discord_account(ctx.author.id, game_user_id)
    
    # Success message
    embed = discord.Embed(
        title="✅ Account Linked Successfully!",
        description=f"Your Discord account is now linked to **{username}**!",
        color=discord.Color.green()
    )
    embed.add_field(name="💰 Money", value=format_number(game_data.get('money', 0)), inline=True)
    embed.add_field(name="💎 Gems", value=format_number(game_data.get('gems', 0)), inline=True)
    embed.add_field(name="🏆 Tier", value=game_data.get('highestTier', 0), inline=True)
    
    embed.add_field(
        name="🎁 Benefits Unlocked:",
        value=(
            "✅ Use `!me` to see your stats anytime\n"
            "✅ Get exclusive Discord rewards\n"
            "✅ Participate in Discord events\n"
            "✅ Receive **100 FREE GEMS**!"
        ),
        inline=False
    )
    
    await ctx.send(embed=embed)
    
    # Give linking reward (100 gems)
    current_gems = game_data.get('gems', 0)
    db.reference(f'users/{game_user_id}/game_data/gems').set(current_gems + 100)
    
    await ctx.send(f"🎁 **Bonus:** You received **100 Gems** for linking your account!")

@bot.command(name='me', aliases=['myaccount', 'mystats'])
async def my_account(ctx):
    """Show your own game stats (requires linked account)"""
    
    game_user_id = get_linked_game_account(ctx.author.id)
    
    if not game_user_id:
        embed = discord.Embed(
            title="❌ Account Not Linked",
            description="You haven't linked your game account yet!",
            color=discord.Color.red()
        )
        embed.add_field(
            name="🔗 How to link:",
            value="Use `!link <your-login-code>` to connect your account and get **100 FREE GEMS**!",
            inline=False
        )
        await ctx.send(embed=embed)
        return
    
    player_data = get_player_data(game_user_id)
    game_data = player_data.get('game_data', {})
    
    embed = discord.Embed(
        title=f"📊 Your Stats - {game_data.get('username', 'Unknown')}",
        description=f"Discord: {ctx.author.mention}",
        color=discord.Color.blue()
    )
    
    embed.add_field(name="💰 Money", value=format_number(game_data.get('money', 0)), inline=True)
    embed.add_field(name="💎 Gems", value=format_number(game_data.get('gems', 0)), inline=True)
    embed.add_field(name="🏆 Tier", value=game_data.get('highestTier', 0), inline=True)
    
    embed.add_field(name="⚡ Money/Click", value=format_number(game_data.get('moneyPerClick', 1)), inline=True)
    embed.add_field(name="🖱️ Total Clicks", value=format_number(game_data.get('clicksTotal', 0)), inline=True)
    
    time_hours = game_data.get('totalTimePlayed', 0) / 3600
    embed.add_field(name="⏰ Play Time", value=f"{time_hours:.1f}h", inline=True)
    
    embed.add_field(name="🔄 Rebirth Points", value=game_data.get('rebirthPoints', 0), inline=True)
    embed.add_field(name="🌟 Achievements", value=len(game_data.get('achievements', [])), inline=True)
    
    embed.set_thumbnail(url=ctx.author.display_avatar.url)
    embed.set_footer(text=f"Linked Account • User ID: {game_user_id[:20]}...")
    
    await ctx.send(embed=embed)

@bot.command(name='unlink')
@commands.has_role(ADMIN_ROLE_NAME)
async def unlink_account(ctx, member: discord.Member):
    """[ADMIN] Unlink a user's game account - Usage: !unlink @user"""
    
    game_user_id = get_linked_game_account(member.id)
    
    if not game_user_id:
        await ctx.send(f"❌ {member.mention} doesn't have a linked account!")
        return
    
    # Unlink
    db.reference(f'discord_links/{member.id}').delete()
    if member.id in LINKED_ACCOUNTS:
        del LINKED_ACCOUNTS[member.id]
    
    embed = discord.Embed(
        title="✅ Account Unlinked",
        description=f"Unlinked {member.mention}'s game account",
        color=discord.Color.green()
    )
    
    await ctx.send(embed=embed)

# Leaderboard Commands
@bot.command(name='leaderboard', aliases=['lb', 'top'])
async def leaderboard(ctx, category: str = 'money'):
    """Show top 10 players - Usage: !leaderboard [money|gems|tier|mpc|time|clicks]"""
    
    valid_categories = ['money', 'gems', 'tier', 'mpc', 'time', 'clicks']
    if category.lower() not in valid_categories:
        await ctx.send(f"❌ Invalid category! Use: {', '.join(valid_categories)}")
        return
    
    top_players = get_leaderboard(category.lower(), 10)
    
    category_names = {
        'money': '💰 Money',
        'gems': '💎 Gems',
        'tier': '🏆 Highest Tier',
        'mpc': '⚡ Money per Click',
        'time': '⏰ Play Time',
        'clicks': '🖱️ Total Clicks'
    }
    
    embed = discord.Embed(
        title=f"🏆 Top 10 - {category_names.get(category, category.title())}",
        color=discord.Color.gold(),
        timestamp=datetime.now()
    )
    
    medals = ['🥇', '🥈', '🥉']
    
    leaderboard_text = ""
    for i, player in enumerate(top_players):
        rank = medals[i] if i < 3 else f"**{i+1}.**"
        username = player['username']
        value = format_number(player['value'])
        
        if category == 'time':
            hours = player['value'] / 3600
            value = f"{hours:.1f}h"
        
        leaderboard_text += f"{rank} {username} - {value}\n"
    
    embed.description = leaderboard_text if leaderboard_text else "No players yet!"
    embed.set_footer(text="Money Clicker Stats")
    
    await ctx.send(embed=embed)

@bot.command(name='player', aliases=['profile'])
async def player_stats(ctx, *, username: str):
    """Show detailed player stats - Usage: !player <username>"""
    
    user_id, player_data = get_player_by_username(username)
    
    if not player_data:
        await ctx.send(f"❌ Player '{username}' not found!")
        return
    
    game_data = player_data.get('game_data', {})
    
    embed = discord.Embed(
        title=f"📊 Player Stats: {game_data.get('username', 'Unknown')}",
        color=discord.Color.blue(),
        timestamp=datetime.now()
    )
    
    embed.add_field(name="💰 Money", value=format_number(game_data.get('money', 0)), inline=True)
    embed.add_field(name="💎 Gems", value=format_number(game_data.get('gems', 0)), inline=True)
    embed.add_field(name="🏆 Tier", value=game_data.get('highestTier', 0), inline=True)
    
    embed.add_field(name="⚡ Money/Click", value=format_number(game_data.get('moneyPerClick', 1)), inline=True)
    embed.add_field(name="🖱️ Total Clicks", value=format_number(game_data.get('clicksTotal', 0)), inline=True)
    
    time_hours = game_data.get('totalTimePlayed', 0) / 3600
    embed.add_field(name="⏰ Play Time", value=f"{time_hours:.1f}h", inline=True)
    
    embed.add_field(name="🔄 Rebirth Points", value=game_data.get('rebirthPoints', 0), inline=True)
    embed.add_field(name="🌟 Achievements", value=len(game_data.get('achievements', [])), inline=True)
    
    # Check if banned
    is_banned = db.reference(f'leaderboards/banned/{user_id}').get()
    if is_banned:
        embed.add_field(name="⚠️ Status", value="🚫 Banned from Leaderboards", inline=False)
    
    embed.set_footer(text=f"Player ID: {user_id[:20]}...")
    
    await ctx.send(embed=embed)

# Admin Commands
@bot.command(name='givemoney')
@commands.has_role(ADMIN_ROLE_NAME)
async def give_money(ctx, username: str, amount: int):
    """[ADMIN] Give money to a player - Usage: !givemoney <username> <amount>"""
    
    user_id, player_data = get_player_by_username(username)
    
    if not player_data:
        await ctx.send(f"❌ Player '{username}' not found!")
        return
    
    game_data = player_data.get('game_data', {})
    current_money = game_data.get('money', 0)
    new_money = current_money + amount
    
    # Update Firebase
    db.reference(f'users/{user_id}/game_data/money').set(new_money)
    
    embed = discord.Embed(
        title="✅ Money Added",
        description=f"Gave **{format_number(amount)}** money to **{username}**",
        color=discord.Color.green()
    )
    embed.add_field(name="Previous", value=format_number(current_money), inline=True)
    embed.add_field(name="New Total", value=format_number(new_money), inline=True)
    
    await ctx.send(embed=embed)

@bot.command(name='givegems')
@commands.has_role(ADMIN_ROLE_NAME)
async def give_gems(ctx, username: str, amount: int):
    """[ADMIN] Give gems to a player - Usage: !givegems <username> <amount>"""
    
    user_id, player_data = get_player_by_username(username)
    
    if not player_data:
        await ctx.send(f"❌ Player '{username}' not found!")
        return
    
    game_data = player_data.get('game_data', {})
    current_gems = game_data.get('gems', 0)
    new_gems = current_gems + amount
    
    # Update Firebase
    db.reference(f'users/{user_id}/game_data/gems').set(new_gems)
    
    embed = discord.Embed(
        title="✅ Gems Added",
        description=f"Gave **{format_number(amount)}** gems to **{username}**",
        color=discord.Color.purple()
    )
    embed.add_field(name="Previous", value=format_number(current_gems), inline=True)
    embed.add_field(name="New Total", value=format_number(new_gems), inline=True)
    
    await ctx.send(embed=embed)

@bot.command(name='ban')
@commands.has_role(ADMIN_ROLE_NAME)
async def ban_player(ctx, username: str):
    """[ADMIN] Ban player from leaderboards - Usage: !ban <username>"""
    
    user_id, player_data = get_player_by_username(username)
    
    if not player_data:
        await ctx.send(f"❌ Player '{username}' not found!")
        return
    
    # Ban from leaderboard
    db.reference(f'leaderboards/banned/{user_id}').set(True)
    
    embed = discord.Embed(
        title="🚫 Player Banned",
        description=f"**{username}** has been banned from leaderboards",
        color=discord.Color.red()
    )
    
    await ctx.send(embed=embed)

@bot.command(name='unban')
@commands.has_role(ADMIN_ROLE_NAME)
async def unban_player(ctx, username: str):
    """[ADMIN] Unban player from leaderboards - Usage: !unban <username>"""
    
    user_id, player_data = get_player_by_username(username)
    
    if not player_data:
        await ctx.send(f"❌ Player '{username}' not found!")
        return
    
    # Unban from leaderboard
    db.reference(f'leaderboards/banned/{user_id}').delete()
    
    embed = discord.Embed(
        title="✅ Player Unbanned",
        description=f"**{username}** has been unbanned from leaderboards",
        color=discord.Color.green()
    )
    
    await ctx.send(embed=embed)

@bot.command(name='announce')
@commands.has_role(ADMIN_ROLE_NAME)
async def announce(ctx, *, message: str):
    """[ADMIN] Post announcement - Usage: !announce <message>"""
    
    embed = discord.Embed(
        title="📢 Announcement",
        description=message,
        color=discord.Color.gold(),
        timestamp=datetime.now()
    )
    embed.set_footer(text=f"Posted by {ctx.author.name}")
    
    await ctx.send(embed=embed)

@bot.command(name='stats')
async def game_stats(ctx):
    """Show overall game statistics"""
    
    players = get_all_players()
    total_players = len(players)
    
    total_money = sum(p.get('game_data', {}).get('money', 0) for p in players.values())
    total_clicks = sum(p.get('game_data', {}).get('clicksTotal', 0) for p in players.values())
    total_gems = sum(p.get('game_data', {}).get('gems', 0) for p in players.values())
    
    embed = discord.Embed(
        title="📊 Money Clicker - Global Stats",
        color=discord.Color.blue(),
        timestamp=datetime.now()
    )
    
    embed.add_field(name="👥 Total Players", value=f"{total_players:,}", inline=True)
    embed.add_field(name="💰 Total Money", value=format_number(total_money), inline=True)
    embed.add_field(name="🖱️ Total Clicks", value=format_number(total_clicks), inline=True)
    embed.add_field(name="💎 Total Gems", value=format_number(total_gems), inline=True)
    
    embed.set_footer(text="Money Clicker Statistics")
    
    await ctx.send(embed=embed)

# Error Handling
@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.MissingRole):
        await ctx.send("❌ You don't have permission to use this command!")
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send(f"❌ Missing argument! Use `!help {ctx.command}` for usage info.")
    elif isinstance(error, commands.CommandNotFound):
        pass  # Ignore unknown commands
    else:
        await ctx.send(f"❌ An error occurred: {str(error)}")
        print(f"Error: {error}")

# Run Bot
if __name__ == '__main__':
    print("🤖 Starting Discord Bot...")
    print("📝 Make sure to set your bot token in config!")
    # Load environment variables from .env (optional)
    load_dotenv()

    # Try common env var names
    TOKEN = os.getenv('DISCORD_TOKEN')

    if not TOKEN:
        print('❌ No Discord token found. Set DISCORD_TOKEN in a .env file or environment variables.')
        print('   Create a .env file with: DISCORD_TOKEN=your_token_here')
        raise SystemExit(1)

    try:
        bot.run(TOKEN)
    except Exception as e:
        print(f"❌ Failed to start bot: {e}")
        print("Make sure you've set a valid bot token!")

/* stats-panel.js - Statistics panel for category nodes */

import { sectTypeName, itemTypeName, wearName, sexName, races } from './constants.js';
import { getMobByVNum, getObjByVNum } from './utils.js';

/**
 * Render stats panel for a category
 * @param {string} categoryType - 'rooms', 'mobs', 'objects', 'shops', 'helps'
 * @param {Object} area - Area data
 * @returns {HTMLElement}
 */
export function renderStatsPanel(categoryType, area) {
    const container = document.createElement('div');
    container.className = 'stats-panel form-entity';
    
    const stats = calculateStats(categoryType, area);
    
    container.innerHTML = `
        <div class="form-header">
            <h3>${stats.title}</h3>
        </div>
        <div class="stats-grid">
            ${stats.items.map(item => `
                <div class="stat-card">
                    <div class="stat-value">${item.value}</div>
                    <div class="stat-label">${item.label}</div>
                    ${item.detail ? `<div class="stat-detail">${item.detail}</div>` : ''}
                </div>
            `).join('')}
        </div>
        ${stats.breakdown ? `
            <div class="stats-breakdown">
                <h4>${stats.breakdown.title}</h4>
                <div class="breakdown-list">
                    ${stats.breakdown.items.map(item => `
                        <div class="breakdown-item">
                            <span class="breakdown-label">${item.label}</span>
                            <span class="breakdown-value">${item.value}</span>
                            <span class="breakdown-bar" style="width: ${item.percent}%"></span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
    
    return container;
}

/**
 * Calculate stats for a category
 */
function calculateStats(categoryType, area) {
    switch (categoryType) {
        case 'rooms': return calculateRoomStats(area);
        case 'mobs': return calculateMobStats(area);
        case 'objects': return calculateObjectStats(area);
        case 'shops': return calculateShopStats(area);
        case 'helps': return calculateHelpStats(area);
        default: return { title: 'Stats', items: [] };
    }
}

function calculateRoomStats(area) {
    const rooms = area.rooms || [];
    const items = [
        { value: rooms.length, label: 'Total Rooms' }
    ];
    
    if (rooms.length > 0) {
        const vnums = rooms.map(r => r.VNum);
        items.push({ 
            value: `${Math.min(...vnums)} - ${Math.max(...vnums)}`, 
            label: 'VNum Range' 
        });
        
        const withDesc = rooms.filter(r => r.descr && r.descr.trim()).length;
        items.push({ 
            value: withDesc, 
            label: 'With Description',
            detail: `${rooms.length - withDesc} empty`
        });
    }
    
    // Sector type breakdown
    const sectorCounts = {};
    rooms.forEach(r => {
        const name = sectTypeName.find(s => s.number === r.sectorType)?.name || `Type ${r.sectorType}`;
        sectorCounts[name] = (sectorCounts[name] || 0) + 1;
    });
    
    const breakdown = Object.entries(sectorCounts)
        .map(([label, value]) => ({
            label,
            value,
            percent: Math.round((value / rooms.length) * 100)
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
    
    return {
        title: '📊 Rooms Statistics',
        items,
        breakdown: breakdown.length > 0 ? { title: 'By Sector Type', items: breakdown } : null
    };
}

function calculateMobStats(area) {
    const mobs = area.mobs || [];
    const items = [
        { value: mobs.length, label: 'Total Mobiles' }
    ];
    
    if (mobs.length > 0) {
        const vnums = mobs.map(m => m.VNum);
        items.push({ 
            value: `${Math.min(...vnums)} - ${Math.max(...vnums)}`, 
            label: 'VNum Range' 
        });
        
        const levels = mobs.map(m => m.level);
        const avgLevel = Math.round(levels.reduce((a, b) => a + b, 0) / levels.length);
        items.push({ 
            value: avgLevel, 
            label: 'Average Level',
            detail: `Range: ${Math.min(...levels)} - ${Math.max(...levels)}`
        });
        
        const totalGold = mobs.reduce((sum, m) => sum + (m.gold || 0), 0);
        items.push({ 
            value: totalGold.toLocaleString(), 
            label: 'Total Gold' 
        });
        
        const shopkeepers = mobs.filter(m => m.isShopKeeper).length;
        items.push({ 
            value: shopkeepers, 
            label: 'Shopkeepers' 
        });
        
        const withSpecial = mobs.filter(m => m.special && m.special !== '').length;
        items.push({ 
            value: withSpecial, 
            label: 'With Specials' 
        });
    }
    
    // Alignment breakdown
    const alignmentCounts = { Good: 0, Neutral: 0, Evil: 0 };
    mobs.forEach(m => {
        if (m.align > 100) alignmentCounts.Good++;
        else if (m.align < -100) alignmentCounts.Evil++;
        else alignmentCounts.Neutral++;
    });
    
    const breakdown = Object.entries(alignmentCounts)
        .map(([label, value]) => ({
            label,
            value,
            percent: mobs.length > 0 ? Math.round((value / mobs.length) * 100) : 0
        }));
    
    return {
        title: '👤 Mobiles Statistics',
        items,
        breakdown: breakdown.length > 0 ? { title: 'By Alignment', items: breakdown } : null
    };
}

function calculateObjectStats(area) {
    const objs = area.objs || [];
    const items = [
        { value: objs.length, label: 'Total Objects' }
    ];
    
    if (objs.length > 0) {
        const vnums = objs.map(o => o.VNum);
        items.push({ 
            value: `${Math.min(...vnums)} - ${Math.max(...vnums)}`, 
            label: 'VNum Range' 
        });
        
        const weights = objs.map(o => o.weight || 0);
        const avgWeight = (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1);
        items.push({ 
            value: avgWeight, 
            label: 'Average Weight',
            detail: `Total: ${weights.reduce((a, b) => a + b, 0).toFixed(1)}`
        });
        
        const costs = objs.map(o => o.cost || 0);
        const avgCost = Math.round(costs.reduce((a, b) => a + b, 0) / costs.length);
        items.push({ 
            value: avgCost.toLocaleString(), 
            label: 'Average Cost',
            detail: `Total: ${costs.reduce((a, b) => a + b, 0).toLocaleString()}`
        });
    }
    
    // Type breakdown
    const typeCounts = {};
    objs.forEach(o => {
        const name = itemTypeName.find(t => t.number === o.type)?.name || `Type ${o.type}`;
        typeCounts[name] = (typeCounts[name] || 0) + 1;
    });
    
    const breakdown = Object.entries(typeCounts)
        .map(([label, value]) => ({
            label,
            value,
            percent: Math.round((value / objs.length) * 100)
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
    
    return {
        title: '📦 Objects Statistics',
        items,
        breakdown: breakdown.length > 0 ? { title: 'By Type', items: breakdown } : null
    };
}

function calculateShopStats(area) {
    const mobs = area.mobs || [];
    const shops = mobs.filter(m => m.isShopKeeper);
    const items = [
        { value: shops.length, label: 'Total Shops' }
    ];
    
    if (shops.length > 0) {
        const profitBuys = shops.map(s => s.profitBuy || 100);
        const avgProfitBuy = Math.round(profitBuys.reduce((a, b) => a + b, 0) / profitBuys.length);
        items.push({ 
            value: `${avgProfitBuy}%`, 
            label: 'Avg Profit Buy' 
        });
        
        const profitSells = shops.map(s => s.profitSell || 100);
        const avgProfitSell = Math.round(profitSells.reduce((a, b) => a + b, 0) / profitSells.length);
        items.push({ 
            value: `${avgProfitSell}%`, 
            label: 'Avg Profit Sell' 
        });
        
        const openHours = shops.map(s => s.openHour || 0);
        const closeHours = shops.map(s => s.closeHour || 23);
        items.push({ 
            value: `${Math.min(...openHours)}:00 - ${Math.max(...closeHours)}:00`, 
            label: 'Operating Hours' 
        });
    }
    
    // Trade type breakdown
    const tradeCounts = {};
    shops.forEach(s => {
        (s.buyType || []).forEach(bt => {
            if (bt > 0) {
                const name = itemTypeName.find(t => t.number === bt)?.name || `Type ${bt}`;
                tradeCounts[name] = (tradeCounts[name] || 0) + 1;
            }
        });
    });
    
    const breakdown = Object.entries(tradeCounts)
        .map(([label, value]) => ({
            label,
            value,
            percent: shops.length > 0 ? Math.round((value / shops.length) * 100) : 0
        }))
        .sort((a, b) => b.value - a.value);
    
    return {
        title: '🏪 Shops Statistics',
        items,
        breakdown: breakdown.length > 0 ? { title: 'Trade Types', items: breakdown } : null
    };
}

function calculateHelpStats(area) {
    const helps = area.helps || [];
    const items = [
        { value: helps.length, label: 'Total Help Entries' }
    ];
    
    if (helps.length > 0) {
        const levels = helps.map(h => h.level || 0);
        items.push({ 
            value: `${Math.min(...levels)} - ${Math.max(...levels)}`, 
            label: 'Level Range' 
        });
        
        const withText = helps.filter(h => h.text && h.text.trim() && h.text !== '$').length;
        items.push({ 
            value: withText, 
            label: 'With Description',
            detail: `${helps.length - withText} empty`
        });
        
        const totalKeywords = helps.reduce((sum, h) => sum + (h.keywords?.length || 0), 0);
        items.push({ 
            value: Math.round(totalKeywords / helps.length), 
            label: 'Avg Keywords Length' 
        });
    }
    
    // Level breakdown
    const levelCounts = {};
    helps.forEach(h => {
        const level = h.level || 0;
        const bracket = level === 0 ? 'Level 0' : 
                       level <= 10 ? '1-10' : 
                       level <= 30 ? '11-30' : 
                       level <= 50 ? '31-50' : '51+';
        levelCounts[bracket] = (levelCounts[bracket] || 0) + 1;
    });
    
    const breakdown = Object.entries(levelCounts)
        .map(([label, value]) => ({
            label,
            value,
            percent: Math.round((value / helps.length) * 100)
        }));
    
    return {
        title: '❓ Helps Statistics',
        items,
        breakdown: breakdown.length > 0 ? { title: 'By Level', items: breakdown } : null
    };
}

import fs from 'fs';
import path from 'path';
import os from 'os';

const SETTINGS_CACHE_TTL = 5000; // 5 seconds

let cachedSettings = null;
let cacheTimestamp = 0;

function getSettingsPath() {
  const agentHome = process.env.AGENT_HOME || path.join(os.homedir(), '.qwen');
  return path.join(agentHome, 'settings.json');
}

export function readSettings({ forceRefresh = false } = {}) {
  const now = Date.now();

  if (!forceRefresh && cachedSettings && (now - cacheTimestamp) < SETTINGS_CACHE_TTL) {
    return cachedSettings;
  }

  const settingsPath = getSettingsPath();

  try {
    const raw = fs.readFileSync(settingsPath, 'utf8');
    cachedSettings = JSON.parse(raw);
    cacheTimestamp = now;
    return cachedSettings;
  } catch (e) {
    if (!cachedSettings) {
      cachedSettings = {};
    }
    return cachedSettings;
  }
}

export function getModels() {
  const settings = readSettings();
  const models = [];

  const providers = settings.modelProviders || {};
  for (const [providerName, providerModels] of Object.entries(providers)) {
    if (!Array.isArray(providerModels)) continue;
    for (const m of providerModels) {
      models.push({
        id: m.id,
        name: m.name || m.id,
        provider: providerName,
        baseUrl: m.baseUrl || '',
        envKey: m.envKey || '',
        modalities: m.generationConfig?.modalities || {},
        extraBody: m.generationConfig?.extra_body || {},
      });
    }
  }

  return models;
}

export function getActiveModel() {
  const settings = readSettings();
  return settings.model?.name || null;
}

export function getFastModel() {
  const settings = readSettings();
  return settings.fastModel || null;
}

export function getMcpServers() {
  const settings = readSettings();
  return settings.mcpServers || {};
}

export function getEnvKeys() {
  const settings = readSettings();
  return settings.env || {};
}

export function getSelectedProvider() {
  const settings = readSettings();
  return settings.security?.auth?.selectedType || null;
}

export function getPublicSettings() {
  const models = getModels();
  const activeModel = getActiveModel();
  const fastModel = getFastModel();
  const mcpServers = getMcpServers();
  const selectedProvider = getSelectedProvider();

  return {
    models,
    activeModel,
    fastModel,
    selectedProvider,
    mcpServers: Object.entries(mcpServers).map(([name, config]) => ({
      name,
      command: config.command || '',
      args: config.args || [],
      envKeys: config.env ? Object.keys(config.env) : [],
    })),
  };
}

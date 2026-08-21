// Safe deployWorker utility with defensive configuration checks
export interface DeployConfig {
  deployTarget?: string | null;
  environment?: string;
  autoRollback?: boolean;
}

export function processDeployment(config?: DeployConfig | null) {
  try {
    // Defensive extraction to prevent "Cannot read properties of null (reading 'deployTarget')"
    const target = config?.deployTarget || 'cloud_run';
    const env = config?.environment || 'production';
    const rollback = config?.autoRollback ?? true;

    return {
      success: true,
      target,
      env,
      autoRollback: rollback,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Deployment Config Exception: ${err.message}`,
      target: 'cloud_run',
    };
  }
}

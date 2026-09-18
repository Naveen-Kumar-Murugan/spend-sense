#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SpendSenseStack } from '../infrastructure/spendsense-stack';

const app = new cdk.App();

new SpendSenseStack(app, 'SpendSenseStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'ap-south-1',
    },
    description: 'SpendSense — intelligent personal finance (hackathon MVP)',
});
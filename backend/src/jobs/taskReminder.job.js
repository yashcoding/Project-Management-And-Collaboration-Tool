import  cron from 'node-cron'
import  Task from '../models/Task'

// Runs every day at 8:00 AM — logs tasks due today
const startTaskReminderJob = () => {
  cron.schedule('0 8 * * *', async () => {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      today.setHours(0, 0, 0, 0);
      tomorrow.setHours(0, 0, 0, 0);

      const dueTasks = await Task.find({
        dueDate: { $gte: today, $lt: tomorrow },
        status: { $ne: 'done' },
      }).populate('assignee', 'name email').populate('project', 'name');

      console.log(`⏰ [Job] Due today: ${dueTasks.length} task(s)`);
      // TODO: send email notifications via nodemailer here
    } catch (err) {
      console.error('Task reminder job error:', err.message);
    }
  });

  console.log('✅ Task reminder job scheduled (daily 8:00 AM)');
};

export default startTaskReminderJob;
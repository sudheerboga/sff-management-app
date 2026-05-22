import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, Avatar, Switch, FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useAuthStore } from '@/stores/authStore';
import { getStaffMembers, inviteStaff, toggleStaffStatus } from '@/services/staff';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { format } from 'date-fns';

export default function StaffPage() {
  const user = useAuthStore((s) => s.user);
  const boutiqueId = user?.boutiqueId || '';
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('+91');
  const [inviteRole, setInviteRole] = useState<'admin' | 'staff'>('staff');

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff', boutiqueId],
    queryFn: () => getStaffMembers(boutiqueId),
    enabled: !!boutiqueId,
  });

  const inviteMutation = useMutation({
    mutationFn: () => inviteStaff(boutiqueId, { name: inviteName, phone: invitePhone, role: inviteRole, invitedBy: user!.uid }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff', boutiqueId] });
      enqueueSnackbar(`${inviteName} invited. They can now log in with their phone.`, { variant: 'success' });
      setInviteOpen(false);
      setInviteName('');
      setInvitePhone('+91');
    },
    onError: () => enqueueSnackbar('Failed to invite staff', { variant: 'error' }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ uid, isActive }: { uid: string; isActive: boolean }) => toggleStaffStatus(uid, isActive),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff', boutiqueId] }); },
  });

  const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Box>
      <PageHeader
        title="Staff"
        subtitle={`${staff.length} team members`}
        actionLabel="Invite Staff"
        actionIcon={<AddIcon />}
        onAction={() => setInviteOpen(true)}
      />

      {isLoading || staff.length === 0 ? (
        !isLoading && (
          <EmptyState
            icon={<PeopleIcon />}
            title="No staff yet"
            description="Invite your team members. They can log in with their phone number after being invited."
            actionLabel="Invite Staff"
            onAction={() => setInviteOpen(true)}
          />
        )
      ) : (
        <Grid container spacing={1.5}>
          {staff.map((member) => (
            <Grid item xs={12} sm={6} md={4} key={member.uid}>
              <Card>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar
                      sx={{ width: 44, height: 44, background: (t) => t.palette.brand.gradient, fontSize: 16 }}
                    >
                      {initials(member.name)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={700} noWrap>{member.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{member.phone}</Typography>
                    </Box>
                    <Chip
                      label={member.role}
                      size="small"
                      color={member.role === 'admin' ? 'secondary' : 'default'}
                      sx={{ textTransform: 'capitalize', height: 22, fontSize: 11 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.disabled">
                      Joined {format(member.createdAt, 'd MMM yyyy')}
                    </Typography>
                    {member.uid !== user?.uid && (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={member.isActive}
                            size="small"
                            onChange={(e) => toggleMutation.mutate({ uid: member.uid, isActive: e.target.checked })}
                          />
                        }
                        label={<Typography variant="caption">{member.isActive ? 'Active' : 'Inactive'}</Typography>}
                        labelPlacement="start"
                        sx={{ ml: 0 }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Typography fontFamily="'Playfair Display', serif" fontWeight={700} variant="h6">Invite Staff</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Full Name"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Phone Number"
              value={invitePhone}
              onChange={(e) => setInvitePhone(e.target.value)}
              fullWidth
              helperText="Staff will log in using this phone number"
            />
            <TextField
              label="Role"
              select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'admin' | 'staff')}
              fullWidth
            >
              <MenuItem value="staff">Staff – View & update orders</MenuItem>
              <MenuItem value="admin">Admin – Full boutique access</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setInviteOpen(false)} variant="outlined" size="small">Cancel</Button>
          <Button
            onClick={() => inviteMutation.mutate()}
            variant="contained"
            size="small"
            disabled={!inviteName || !invitePhone || inviteMutation.isPending}
          >
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
